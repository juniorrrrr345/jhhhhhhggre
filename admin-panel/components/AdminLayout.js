import Layout from './Layout'

export default function AdminLayout({ children, title }) {
  return <Layout title={title}>{children}</Layout>
}