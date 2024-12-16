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


export const ModelCard = ({
  model,
  onDelete,
  onEdit,
  deleteModel,
  onCheck,
  userRole
}) => {
  const { _id, coverPicture, modelName, file } = model;

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
        {/* View Actions - Keeping the working dropdown structure */}
        <div className='flex w-[100%] items-center justify-between gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <Button
                variant="outline"
                className="w-full flex-row justify-between rounded-lg border-slate-200 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </span>
                <ChevronUp className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] z-50 bg-white shadow-lg">
              <DropdownMenuItem asChild>
                <Link
                  to={`/view-model/${_id}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  <Eye className="h-4 w-4" /> View Model
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={`/${userRole}/view-evidences/${_id}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  <List className="h-4 w-4" /> View Samples
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={`/${userRole}/view-incidents/${_id}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  <Shield className="h-4 w-4" /> View Incidents
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={`/${userRole}/view-safety/${_id}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  <Shield className="h-4 w-4" /> Safety Tool
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(_id)}
            className="w-2/12 hover:bg-slate-100"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {/* Sample Actions - Keeping the working dropdown structure */}
        <div className='flex w-[100%] items-center justify-between gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <Button
                variant="outline"
                className="w-full flex-row justify-between rounded-lg border-slate-200 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Sample
                </span>
                <ChevronUp className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] z-50 bg-white shadow-lg">
              <DropdownMenuItem asChild>
                <Link
                  to={`/view-model/${_id}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  Sample From Model
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={`/${userRole}/granular-tagging-list/${_id}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                >
                  Sample From Feature List
                </Link>
              </DropdownMenuItem>
              {['admin', 'superAdmin', 'tagger', 'sampler'].includes(userRole) && (
                <DropdownMenuItem asChild>
                  <Link
                    to={`/tag-list-create/${_id}`}
                    className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
                  >
                    New Sample Feature
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onDelete(_id)
              deleteFromDb(getRealFileUrl(file)).then(console.log)
            }}
            className="w-2/12 text-destructive hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};