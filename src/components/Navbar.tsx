import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useSettings } from '@/lib/SettingsContext';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Home,
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  Receipt,
  Settings,
  Menu,
  Package,
  LogOut,
  User,
  FileBarChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { settingsStatus } = useSettings();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if settings are incomplete
  const hasIncompleteSettings = user && !settingsStatus.allComplete;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - always visible */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-black text-white p-1.5 rounded-md">
                <img src="/svgicon/clinic-medical-white.svg" alt="Clinic" className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-black">
                ClinicFlow
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <TooltipProvider>
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
                    to="/inventory" 
                    icon={<Package size={18} />} 
                    label="Inventory" 
                    isActive={isActive("/inventory")} 
                  />
                  <NavItem 
                    to="/reports" 
                    icon={<FileBarChart size={18} />} 
                    label="Reports" 
                    isActive={isActive("/reports")} 
                  />
                  <NavItem 
                    to="/settings" 
                    icon={
                      <div className="relative">
                        <Settings size={18} />
                        {hasIncompleteSettings && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                    } 
                    label={hasIncompleteSettings ? "Settings (Incomplete)" : "Settings"}
                    isActive={isActive("/settings")} 
                  />
                </>
              )}
            </nav>
          </TooltipProvider>

          {/* Right side items: Mobile menu button and User profile */}
          <div className="flex items-center space-x-2">
            {/* User profile/auth buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden border border-gray-200">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gray-100 text-gray-800 font-medium">
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
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
                    <LogOut size={16} className="mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="text-gray-800 hover:text-black">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button - positioned on the right */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center">
                      <div className="bg-black text-white p-1.5 rounded-md mr-2">
                        <img src="/svgicon/clinic-medical-white.svg" alt="Clinic" className="w-5 h-5" />
                      </div>
                      <span className="text-xl font-bold text-black">
                        ClinicFlow
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4 px-2">
                    <nav className="space-y-1">
                      <SheetClose asChild>
                        <MobileNavItem to="/" label="Home" icon={<Home size={18} />} isActive={isActive("/")} />
                      </SheetClose>
                      
                      {user && (
                        <>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/dashboard" 
                              label="Dashboard" 
                              icon={<LayoutDashboard size={18} />}
                              isActive={isActive("/dashboard")} 
                            />
                          </SheetClose>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/patients" 
                              label="Patients" 
                              icon={<Users size={18} />}
                              isActive={isActive("/patients")} 
                            />
                          </SheetClose>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/appointments" 
                              label="Appointments" 
                              icon={<Calendar size={18} />}
                              isActive={isActive("/appointments")} 
                            />
                          </SheetClose>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/prescriptions" 
                              label="Prescriptions" 
                              icon={<Pill size={18} />}
                              isActive={isActive("/prescriptions")} 
                            />
                          </SheetClose>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/invoices" 
                              label="Invoices" 
                              icon={<Receipt size={18} />}
                              isActive={isActive("/invoices")} 
                            />
                          </SheetClose>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/inventory" 
                              label="Inventory" 
                              icon={<Package size={18} />}
                              isActive={isActive("/inventory")} 
                            />
                          </SheetClose>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/reports" 
                              label="Reports" 
                              icon={<FileBarChart size={18} />}
                              isActive={isActive("/reports")} 
                            />
                          </SheetClose>
                          <SheetClose asChild>
                            <MobileNavItem 
                              to="/settings" 
                              label={hasIncompleteSettings ? "Settings (Incomplete)" : "Settings"}
                              icon={
                                <div className="relative">
                                  <Settings size={18} />
                                  {hasIncompleteSettings && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                  )}
                                </div>
                              }
                              isActive={isActive("/settings")} 
                            />
                          </SheetClose>
                        </>
                      )}
                    </nav>

                    {user && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="px-3 py-2 flex items-center">
                          <Avatar className="h-9 w-9 mr-3">
                            <AvatarFallback className="bg-gray-100 text-gray-800 font-medium">
                              {user.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                          </div>
                        </div>
                        <SheetClose asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-red-500 mt-2"
                            onClick={handleSignOut}
                          >
                            <LogOut size={16} className="mr-2" />
                            Sign Out
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                    
                    {!user && (
                      <div className="mt-6 pt-6 border-t px-3 space-y-2">
                        <SheetClose asChild>
                          <Link to="/signin" className="w-full block">
                            <Button variant="outline" className="w-full">Sign In</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/signup" className="w-full block">
                            <Button className="w-full bg-black hover:bg-gray-800 text-white">Sign Up</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Mobile auth buttons */}
            {!user && (
              <div className="md:hidden flex">
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="text-gray-800 hover:text-black">
                    Sign In
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

// Desktop Navigation Item
const NavItem = ({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        to={to}
        className={cn(
          "flex items-center px-3 py-2 rounded-md transition-colors",
          isActive
            ? "bg-gray-100 text-black"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        <div className="relative">
          {icon}
          {isActive && (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black rounded-full" />
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
        ? "bg-gray-100 text-black"
        : "text-gray-600 hover:bg-gray-100"
    )}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar;