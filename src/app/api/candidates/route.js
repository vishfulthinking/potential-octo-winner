import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENCODE_API_KEY,
  baseURL: 'https://opencode.ai/zen/go/v1'
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q') || '';
  const aiMode = searchParams.get('ai') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const dbPath = path.join(process.cwd(), 'dev.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    let data, total;
    let aiFilters = null;
    let finalQuery = rawQ;

    if (aiMode && rawQ) {
      const prompt = `You are a search query parser for an e-commerce talent database. The user is searching for virtual assistants.
User query: "${rawQ}"

Parse the query and return a strict JSON object with the following fields:
1. "keywords": An array of important search keywords (lowercase) for the full-text search engine (e.g. ["shopify", "dutch", "customer support"]). If the query is just a constraint like "last 30 days", return an empty array.
2. "max_rate": integer. The maximum hourly rate they are willing to pay, if specified (e.g. "under $5/hr" -> 5). If not specified, use null.
3. "max_days_inactive": integer. The maximum number of days since they were last active, if specified (e.g. "active in the last 30 days" -> 30). If not specified, use null.

Return ONLY the raw JSON object. No markdown formatting or explanation.`;

      const aiResponse = await openai.chat.completions.create({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      try {
        let content = aiResponse.choices[0].message.content.trim();
        content = content.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        aiFilters = JSON.parse(content);
        if (aiFilters.keywords && aiFilters.keywords.length > 0) {
          finalQuery = aiFilters.keywords.join(' ');
        } else {
          finalQuery = ''; // fallback
        }
      } catch (e) {
        console.error("AI Parse Error:", e);
      }
    }
    
    // Always fetch something, even if no keywords (we'll filter later)
    let ftsQuery = '';
    if (finalQuery) {
      ftsQuery = finalQuery
        .replace(/[^\w\s]/gi, ' ')
        .trim()
        .split(/\s+/)
        .map(word => `"${word}"`)
        .join(' AND ');
    }

    let candidates = [];
    if (ftsQuery) {
      const query = `
        SELECT c.* 
        FROM Candidate c
        JOIN CandidateFTS f ON c.id = f.id
        WHERE CandidateFTS MATCH ?
        ORDER BY rank
        LIMIT ? OFFSET ?
      `;
      candidates = await db.all(query, [ftsQuery, 1000, 0]); // fetch more to filter
    } else {
      candidates = await db.all('SELECT * FROM Candidate ORDER BY createdAt DESC LIMIT 1000');
    }

    // Post-process filters for AI constraints
    if (aiFilters) {
      if (aiFilters.max_rate !== null) {
        candidates = candidates.filter(c => {
          if (!c.rateRaw) return true;
          const match = c.rateRaw.match(/\$?(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            return num <= aiFilters.max_rate;
          }
          return true;
        });
      }
      if (aiFilters.max_days_inactive !== null) {
        candidates = candidates.filter(c => {
          if (!c.lastActive) return false; // missing last active
          // parse something like "March 3rd, 2026 (99 days ago)" or "June 9th, 2026 (yesterday)"
          const match = c.lastActive.match(/(\d+) days ago/);
          if (match) {
            return parseInt(match[1]) <= aiFilters.max_days_inactive;
          }
          if (c.lastActive.includes('yesterday')) return aiFilters.max_days_inactive >= 1;
          if (c.lastActive.includes('today')) return true;
          return true; // fallback
        });
      }
    }

    data = candidates.slice(offset, offset + limit);
    total = candidates.length;

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      aiFilters // Send this back to show in the UI
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
