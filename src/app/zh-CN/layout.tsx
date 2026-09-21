export default function ChineseLocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div lang="zh-CN">{children}</div>;
}
