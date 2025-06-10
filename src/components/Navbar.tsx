import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-md">
                <LayoutDashboard size={20} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                ClinicFlow
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative"
            >
              <Menu size={24} />
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavItem to="/" icon={<Home size={18} />} label="Home" isActive={isActive("/")} />
            
            {user && (
              <>
                <NavItem 
                  to="/dashboard" 
                  icon={<LayoutDashboard size={18} />} 
                  label="Dashboard" 
                  isActive={isActive("/dashboard")} 
                />
                <NavItem 
                  to="/patients" 
                  icon={<Users size={18} />} 
                  label="Patients" 
                  isActive={isActive("/patients")} 
                />
                <NavItem 
                  to="/appointments" 
                  icon={<Calendar size={18} />} 
                  label="Appointments" 
                  isActive={isActive("/appointments")} 
                />
                <NavItem 
                  to="/prescriptions" 
                  icon={<Pill size={18} />} 
                  label="Prescriptions" 
                  isActive={isActive("/prescriptions")} 
                />
                <NavItem 
                  to="/invoices" 
                  icon={<Receipt size={18} />} 
                  label="Invoices" 
                  isActive={isActive("/invoices")} 
                />
                <NavItem 
                  to="/settings" 
                  icon={<Settings size={18} />} 
                  label="Settings" 
                  isActive={isActive("/settings")} 
                />
              </>
            )}
          </nav>

          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden border border-gray-200">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="font-medium">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings size={16} className="mr-2" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/patients" className="flex items-center">
                      <Users size={16} className="mr-2" />
                      <span>Patients</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/appointments" className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Appointments</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/prescriptions" className="flex items-center">
                      <Pill size={16} className="mr-2" />
                      <span>Prescriptions</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/invoices" className="flex items-center">
                      <Receipt size={16} className="mr-2" />
                      <span>Invoices</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="px-4 space-y-1 pb-3">
            <MobileNavItem to="/" label="Home" icon={<Home size={18} />} isActive={isActive("/")} />
            
            {user && (
              <>
                <MobileNavItem 
                  to="/dashboard" 
                  label="Dashboard" 
                  icon={<LayoutDashboard size={18} />}
                  isActive={isActive("/dashboard")} 
                />
                <MobileNavItem 
                  to="/patients" 
                  label="Patients" 
                  icon={<Users size={18} />}
                  isActive={isActive("/patients")} 
                />
                <MobileNavItem 
                  to="/appointments" 
                  label="Appointments" 
                  icon={<Calendar size={18} />}
                  isActive={isActive("/appointments")} 
                />
                <MobileNavItem 
                  to="/prescriptions" 
                  label="Prescriptions" 
                  icon={<Pill size={18} />}
                  isActive={isActive("/prescriptions")} 
                />
                <MobileNavItem 
                  to="/invoices" 
                  label="Invoices" 
                  icon={<Receipt size={18} />}
                  isActive={isActive("/invoices")} 
                />
                <MobileNavItem 
                  to="/settings" 
                  label="Settings" 
                  icon={<Settings size={18} />}
                  isActive={isActive("/settings")} 
                />
              </>
            )}
            
            {!user && (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/signin" className="w-full">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop Navigation Item
const NavItem = ({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        to={to}
        className={cn(
          "flex items-center px-3 py-2 rounded-md transition-colors",
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        <div className="relative">
          {icon}
          {isActive && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </div>
      </Link>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

// Mobile Navigation Item
const MobileNavItem = ({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center px-3 py-2 rounded-md transition-colors",
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-100"
    )}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar; 