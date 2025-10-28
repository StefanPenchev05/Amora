package user

type Email string
type Username string
type PasswordHash string

type Gender string

const (
	GenderFemale         Gender = "Female"
	GenderMale           Gender = "Male"
	GenderSomethingElse  Gender = "Something else"
	GenderPreferNotToSay Gender = "Prefer not to say"
)
