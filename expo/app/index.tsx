import { Redirect } from 'expo-router';
import { useSession } from '@/hooks/session-store';

export default function Index() {
  const { currentSession, isLoading } = useSession();
  
  if (isLoading) {
    return null;
  }
  
  // If there's an active session, go to home, otherwise go to start session
  return <Redirect href={currentSession ? "/home" : "/start-session"} />;
}