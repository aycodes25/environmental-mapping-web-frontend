import React from "react";
import { useSelector } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import { Mail, MapPin, User, UserCircle, Building2 } from "lucide-react"; // Install lucide-react first

// Import shadcn components
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

// default avatar
const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";


const UserProfile = () => {
    const { user } = useLoaderData();
    const navigate = useNavigate();
    const user_one = useSelector((state) => state.userState.user);
    const localUser = getUserFromLocalStorage();
    const currentUser = localUser || user_one;

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-base font-semibold">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
            <Card className="mx-auto max-w-3xl border-none shadow-xl">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Column - Avatar and Main Info */}
                        <div className="flex flex-col items-center space-y-4 md:w-1/3">
                          <Avatar className="h-32 w-32 ring-4 ring-primary/10">
              <AvatarImage 
                src={user.imageUrl || defaultAvatar} 
                alt={user.fullname || user.username}
                className="object-cover"
                />
                <AvatarFallback className="bg-primary/5">
              <img 
              src={defaultAvatar}
            alt="default profile"
            className="h-full w-full object-cover"
        />
                 </AvatarFallback>
                      </Avatar>
                            
                            <div className="text-center  space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {user.fullname || user.username}
                                </h2>
                                <Badge variant="secondary" className="text-sm text-white">
                                    {user.role}
                                </Badge>
                            </div>

                            {user._id === currentUser._id && (
                                <Button
                                    className="w-full text-white md:w-auto"
                                    onClick={() =>
                                        navigate(
                                            `/${
                                                ['admin', 'superAdmin'].includes(currentUser.role)
                                                    ? 'admin'
                                                    : currentUser.role
                                            }/edit-user/${currentUser._id}`
                                        )
                                    }
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        {/* Right Column - User Details */}
                        <div className="flex-1 space-y-4">
                            <div className="grid gap-4">
                                <InfoItem 
                                    icon={UserCircle}
                                    label="Username"
                                    value={user.username}
                                />
                                <InfoItem 
                                    icon={Mail}
                                    label="Email Address"
                                    value={user.email}
                                />
                                <InfoItem 
                                    icon={User}
                                    label="Role"
                                    value={user.role}
                                />
                                <InfoItem 
                                    icon={MapPin}
                                    label="Location"
                                    value={user?.role === "superAdmin" ? "All locations" : user?.locations?.name}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfile;