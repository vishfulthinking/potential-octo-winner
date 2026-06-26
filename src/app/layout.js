import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'E-com Talent Match',
  description: 'Find the perfect e-commerce talent.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
