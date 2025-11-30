import Router from 'next/router';

export async function fetchWithAuth(url, options = {}) {
  try {
    const res = await fetch(url, options);

    if (res.status === 401) {
      // إعادة توجيه تلقائية لصفحة تسجيل الدخول
      Router.push('/login');
      return null; // توقف التنفيذ
    }

    return res;
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}
