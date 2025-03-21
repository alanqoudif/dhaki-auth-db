# ذكي - نظام المصادقة وتتبع الأسئلة

هذا المستودع يحتوي على نظام المصادقة وتتبع الأسئلة لتطبيق ذكي، باستخدام Supabase للمصادقة وتخزين البيانات.

## تثبيت المكتبات المطلوبة

تحتاج إلى تثبيت المكتبات التالية:

```bash
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react @supabase/supabase-js
```

## تكوين Supabase

### 1. إنشاء قاعدة البيانات

1. قم بتسجيل الدخول إلى [Supabase](https://supabase.com/).
2. أنشئ مشروعًا جديدًا.
3. انتقل إلى SQL Editor وقم بتنفيذ SQL من الملف `supabase-schema.sql`.

### 2. إعداد متغيرات البيئة

قم بإنشاء ملف `.env.local` في مجلد المشروع وأضف المتغيرات التالية:

```
# Supabase Configuration
# Public keys (safe for client-side usage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Private keys (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
```

## حل المشاكل الشائعة

### 1. خطأ `Can't resolve '@supabase/auth-helpers-react'`

هذا الخطأ يحدث عندما تكون مكتبة `@supabase/auth-helpers-react` غير مثبتة. قم بتثبيتها باستخدام:

```bash
npm install @supabase/auth-helpers-react
```

### 2. خطأ في استخدام `next/headers` في مكونات العميل

يجب تحديث ملف `lib/supabase.ts` للتمييز بشكل صحيح بين مكونات العميل والخادم:

```typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from './database.types';

// 1. للاستخدام في مكونات العميل فقط
export const createClientComponent = () => {
  return createClientComponentClient<Database>();
};

// 2. للاستخدام في مكونات الخادم فقط (في ملف منفصل)
// في ملف منفصل: lib/supabase-server.ts
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// 
// export const createServerComponent = () => {
//   return createServerComponentClient({ cookies });
// };
```

### 3. دمج Supabase في تطبيق Next.js

أضف مزود الجلسة Supabase في ملف `app/providers.tsx`:

```tsx
// app/providers.tsx
"use client";

import { ReactNode } from "react";
import { createClientComponent } from "@/lib/supabase";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const supabase = createClientComponent();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
```

### 4. إضافة middleware للتحكم في الجلسات

تأكد من أن ملف `middleware.ts` موجود في المجلد الرئيسي لمشروعك:

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

## تحديث ملف Home Page لاستخدام مكونات المصادقة

```tsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuestionLimits } from '@/hooks/useQuestionLimits';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { UserAccountNav } from '@/components/user/user-account-nav';
import { HomeContent } from '@/components/HomeContent';

export default function Home() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();

  return (
    <div className="container mx-auto">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">ذكي</h1>
        <div>
          {user ? (
            <UserAccountNav user={user} />
          ) : (
            <button 
              onClick={() => setShowAuthDialog(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </header>

      <main>
        <HomeContent />
      </main>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </div>
  );
}
```

## التحقق من الأخطاء

إذا كنت لا تزال تواجه مشكلات، تأكد من:

1. تثبيت جميع المكتبات المطلوبة.
2. التأكد من تنفيذ SQL في Supabase بنجاح.
3. التحقق من متغيرات البيئة الصحيحة.
4. تجنب استخدام مكونات الخادم والعميل معًا بشكل غير صحيح.

## موارد إضافية

- [توثيق Supabase](https://supabase.io/docs)
- [توثيق Next.js](https://nextjs.org/docs)
- [توثيق Supabase Auth Helpers لـ Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)