// "use client";

// import { useRouter } from "next/navigation";

// import {
//     Dialog,
//     DialogContent,
//     DialogTrigger,
//     DialogClose
// } from "@/components/ui/dialog";
// import TopupDailog from "./TopupComponent_draft";
// import { useState } from "react";


// interface ButtonProps {
//     children: React.ReactNode;
//     mode?: "modal" | "redirect",
//     asChild?: boolean;
// };

// export const ModalButton = ({
//     children,
//     mode = "redirect",
//     asChild,
// }: ButtonProps) => {
//     const router = useRouter();
//     const [open,setOpen] = useState<boolean>(false)

//     const onClick = () => {
//         router.push("/");
//     };

//     if (mode === "modal") {
//         return (
//             <Dialog open={open} onOpenChange={setOpen} >
//                 <DialogTrigger asChild={asChild}>
//                     {children}
//                 </DialogTrigger>
//                 <DialogContent className="p-0 w-auto bg-transparent border-none">
//                     <TopupDailog setOpen={setOpen}/>
//                 </DialogContent>
//             </Dialog>
//         )
//     }

//     return (
//         <span onClick={onClick} className="cursor-pointer">
//             {children}
//         </span>
//     );
// };