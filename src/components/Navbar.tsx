import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  Receipt,
  Settings,
} from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              ClinicFlow
            </Link>
          </div>

          <nav className="hidden md:flex space-x-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Home size={20} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Home</TooltipContent>
            </Tooltip>
            
            {user && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/dashboard" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <LayoutDashboard size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Dashboard</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/patients" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <Users size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Patients</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/appointments" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <Calendar size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Appointments</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/prescriptions" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <Pill size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Prescriptions</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/invoices" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <Receipt size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Invoices</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/settings" className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <Settings size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </>
            )}
          </nav>

          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/patients">Patients</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/appointments">Appointments</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/prescriptions">Prescriptions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/invoices">Invoices</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-4">
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 