import React from 'react'
import { auth } from '@/server/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import type { User } from 'prisma/interfaces';

async function AdminRootPage() {
  const session = await auth();

  if (!session || !((session.user as User).role !== Role.ADMIN)) {
    return redirect('/api/auth/signin');
  } else {
    redirect('/admin/overview');
  }
}

export default AdminRootPage
