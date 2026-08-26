import { redirect } from 'next/navigation';

export default function NoticiaRedirect() {
  redirect('/admin/noticias');
}
