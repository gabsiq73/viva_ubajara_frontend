import { useState } from "react";
import { getInitials } from "./userDisplay";

interface UserAvatarProps {
    photo?: string;
    name: string;
    className?: string;
}

export default function UserAvatar({ photo, name, className = "" }: UserAvatarProps) {
    const [brokenPhoto, setBrokenPhoto] = useState<string | null>(null);
    const showPhoto = photo && brokenPhoto !== photo;

    return (
        <span className={`site-avatar ${className}`.trim()} aria-hidden="true">
            {showPhoto ? <img src={photo} alt="" onError={() => setBrokenPhoto(photo)} /> : getInitials(name)}
        </span>
    );
}
