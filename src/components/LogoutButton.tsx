import { Button } from 'antd';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface LogoutButtonProps {
  redirectUrl?: string;
  children?: ReactNode;
}

export default function LogoutButton({ redirectUrl = '/', children }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // signOut without redirect to handle manually
    await signOut({ redirect: false });
    router.replace(redirectUrl);
  };

  return (
    <Button
      type="default"
      onClick={handleLogout}
      style={{ borderRadius: 8, marginLeft: 12 }}
    >
      {children || 'Logout'}
    </Button>
  );
}
