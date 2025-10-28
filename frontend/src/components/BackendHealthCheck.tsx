import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ServerCrash, Server } from 'lucide-react';

export function BackendHealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health');
        setIsHealthy(response.ok);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isChecking) return null;

  return isHealthy ? (
    <Alert className="border-green-500 bg-green-50">
      <Server className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        Backend is online and responding
      </AlertDescription>
    </Alert>
  ) : (
    <Alert className="border-red-500 bg-red-50">
      <ServerCrash className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        Backend connection issue - some features may be limited
      </AlertDescription>
    </Alert>
  );
}

