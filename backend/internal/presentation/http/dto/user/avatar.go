package user

import "path"

// AvatarURLFromPhotoID converts a stored avatar photo ID/filename into a relative URL.
// The returned URL is relative so clients can resolve it against the API base URL.
func AvatarURLFromPhotoID(avatarPhotoID *string) *string {
	if avatarPhotoID == nil {
		return nil
	}
	if *avatarPhotoID == "" {
		return nil
	}

	url := path.Join("/uploads", "avatars", *avatarPhotoID)
	return &url
}
