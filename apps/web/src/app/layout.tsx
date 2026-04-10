import './global.css';

export const metadata = {
  title: 'Wrectifai Web',
  description: 'Wrectifai Next.js frontend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
