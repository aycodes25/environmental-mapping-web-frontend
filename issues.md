# Issues

## 2d view broken
- The problem here is centering the `sunAngleCamera` to the model itself

## separate tagging and viewing models page
- A nicer UX will allow users either tag or view tags in one place
- The code of both pages `src/pages/TagModel.jsx` and `src/pages/SingleModel` are'nt too far apart, we could figure out a way to bring both in one page by making the differing parts into separate components to be children of the main viewing page


## Close forms after operation complete e.g tag creation form etc
- current forms stay opened after submision, perhaps closing them will make a better ux and prevent duplicate entries e.g dup tag


## Create tag form very bad ux
- The previous implementation in `src/pages/TagModel.jsx` file used material-ui, somehow but weirdly the tag type selection options after first opening will refuse to open till after some couple seconds
- So currentlyi i made it to use native browser select
- you can test this weird behaviour by uncommenting the code and you are welcome to find a fix so we can have a consistent UI


## Feature requests / change
## Future bugs to come
