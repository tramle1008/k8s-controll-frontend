// them thong tin, gui file docker image.rar

import { Label } from "@mui/icons-material"
import { Input } from "@mui/material";


const InfoUser = () => {
    return (
        <div>
            <h1>you must sent you information about you app </h1>
            {/* Khu cho gui file config nhu kong.yml */}


            {/* Khu xu ly gui duong link docker hub public */}
            <Label></Label>
            <Input></Input>
            {/* Khu xu ly gui image.rar xong toi se gui no sang registry noi bo o 192.168.235.150:5000 toi da xay dung */}


        </div>
    )
}
export default InfoUser;