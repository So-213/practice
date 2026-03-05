export const metadata = {
  title: "DB Learning API",
  description: "SNS風ミニAPI - DB学習用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
