package user

import "errors"

func validateName(name, fieldName string) error {
	if name == "" {
		return errors.New(fieldName + " is required")
	}
	if len(name) > 50 {
		return errors.New(fieldName + " too long (max 50 characters)")
	}
	return nil
}

func validateBio(bio string) error {
	if len(bio) > 500 {
		return errors.New("bio too long (max 500 characters)")
	}
	return nil
}

func validateGender(gender Gender) error {
	switch gender {
	case GenderFemale, GenderMale, GenderSomethingElse, GenderPreferNotToSay, "":
		return nil
	default:
		return errors.New("invalid gender")
	}
}
