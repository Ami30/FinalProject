import { toast } from 'react-toastify';

export const validateInput = (value = "", field = "") =>{
    if(value !== undefined && value !== "" && value !== null){
        return true;
    }

    toast.error(`Please enter valid ${field}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
     });

    return false;
}

