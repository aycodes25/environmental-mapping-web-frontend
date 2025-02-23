// components/ModelCard.jsx
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Eye, List, Shield, Edit, Trash2, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link } from "react-router-dom";
import { getRealFileUrl } from "../utils";
import { deleteFromDb } from "./SceneComponent";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "@/redux/reducers/userReducer";


export const ModelCard = ({
  model,
  onDelete,
  onEdit,
  deleteModel,
  onCheck,
  userRole
}) => {
  const { _id, coverPicture, modelName, file } = model;

  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;

  return (
    <Card className="group w-80 h-auto max-md:w-full overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Image Container with improved styling */}
      <div className="relative h-60 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `url("${getRealFileUrl(coverPicture || "") ||
              'https://res.cloudinary.com/diqqf3eq2/image/upload/v1595959131/person-3_rxtqvi.jpg'
              }")`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Delete Mode Checkbox */}
        {deleteModel && (
          <div className="absolute right-3 top-3 z-10">
            <input
              id={_id}
              onClick={() => onCheck(_id)}
              type="checkbox"
              className="h-5 w-5 rounded-md border-2 border-white bg-white/20 backdrop-blur-sm"
            />
          </div>
        )}

        {/* Model Name */}
        <div className="absolute bottom-0 w-full p-4">
          <h3 className="text-lg font-semibold text-white">
            {modelName}
          </h3>
        </div>
      </div>

      {/* Actions Container */}
      <div className="space-y-3 p-4">
        {/* View Actions */}

        <div className='flex w-[100%] items-center justify-between gap-2'>
          <Link
            to={`/view-model/${_id}`}
            className="flex items-center gap-2 w-full px-4 py-2 border rounded-lg border-slate-200"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Link>
          {
            ['admin', 'superAdmin'].includes(currentUser.role) ?
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(_id)}
                className="w-2/12 hover:bg-slate-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
              : null
          }
        </div>


        {/* Tag Dropdown */}
        <div className='flex w-[100%] items-center justify-between gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="w-full flex justify-between items-center px-4 py-2 border rounded-lg border-slate-200">
                <span className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Tag
                </span>
                <ChevronUp className="h-4 w-4 opacity-50" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] z-50 bg-white shadow-lg">
              <DropdownMenuItem asChild>
                <Link
                  to={`/view-model/${_id}?tagType=sample`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  <List className="h-4 w-4" />
                  Sample
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={`/view-model/${_id}?tagType=incident`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Incident
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {
            ['admin', 'superAdmin'].includes(currentUser.role) ?
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onDelete(_id)
                  deleteFromDb(getRealFileUrl(file)).then(console.log)
                }}
                className="w-2/12 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              : null
          }
        </div>
      </div>
    </Card>
  );
};