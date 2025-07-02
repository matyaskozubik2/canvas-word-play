
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="text-6xl font-bold text-purple-500 mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Stránka nenalezena</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Omlouváme se, ale stránka kterou hledáte neexistuje.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Zpět na hlavní stránku
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
