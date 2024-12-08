// eslint-disable-next-line no-unused-vars
import React from "react";
import { Button, Card } from "@mui/material";
import { useSelector } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";

const UserProfile = () => {
    const { user } = useLoaderData();
    const navigate = useNavigate();
    const user_one = useSelector((state) => state.userState.user);
    const localUser = getUserFromLocalStorage();
    const currentUser = localUser || user_one;
    return(
        <div className="flex flex-grow justify-center items-start p-1 w-full h-auto">
            <Card className="flex flex-col gap-6 items-center py-10 w-full max-w-lg h-auto bg-white rounded-md justify-conter">
                <div className="flex flex-col justify-center items-center"><img className="rounded-full w-[250px] h-[250px]" src={user.imageUrl} alt="profile image"/></div>
                <div className="flex flex-col justify-center items-center text-2xl text-center text-bold"> User Profile </div>
                <div className="flex flex-col justify-center items-center text-center"> <div className="flex flex-row justify-center items-center text-xs">Name</div> <div className="flex flex-row justify-center items-center text-xl text-bold">{user.fullname || user.username}</div> </div>
                <div className="flex flex-col justify-center items-center text-center"> <div className="flex flex-row justify-center items-center text-xs">User Name</div> <div className="flex flex-row justify-center items-center text-xl text-bold">{user.username}</div> </div>
                <div className="flex flex-col justify-center items-center text-center"> <div className="flex flex-row justify-center items-center text-xs">Email</div> <div className="flex flex-row justify-center items-center text-xl text-bold">{user.email}</div> </div>
                <div className="flex flex-col justify-center items-center text-center"> <div className="flex flex-row justify-center items-center text-xs">Role</div> <div className="flex flex-row justify-center items-center text-xl">{user.role}</div> </div>
                <div className="flex flex-col justify-center items-center text-center"> <div className="flex flex-row justify-center items-center text-xs">Location</div> <div className="flex flex-row justify-center items-center text-xl">{user?.role === "superAdmin" ? "All locations" :user?.locations?.name}</div> </div>
                <div className="flex flex-col justify-center items-center text-center"> 
                {user._id === currentUser._id &&<Button className="flex w-[150px] bg-[#021431] text-white"  onClick={() =>
                        navigate(
                          `/${
                            ['admin', 'superAdmin'].includes(currentUser.role)
                              ? 'admin'
                              : currentUser.role
                          }/edit-user/${currentUser._id}`
                        )
                      } >Edit</Button>}
                </div>
            </Card>
        </div>
    )
}

export default UserProfile;