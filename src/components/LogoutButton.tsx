import { Button } from 'antd';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface LogoutButtonProps {
  redirectUrl?: string;
  children?: ReactNode;
}

export default function LogoutButton({ redirectUrl = '/', children }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    router.replace(redirectUrl);
  };

  return (
    <Button
      type="default"
      onClick={handleLogout}
      loading={loading}
      disabled={loading}
      style={{ borderRadius: 8, marginLeft: 12 }}
    >
      {children || 'Logout'}
    </Button>
  );
}
