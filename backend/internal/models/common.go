package models

type Gender string

const (
	Female         Gender = "female"
	Male           Gender = "male"
	Other          Gender = "something_else"
	PreferNotToSay Gender = "prefer_not_to_say"
)
