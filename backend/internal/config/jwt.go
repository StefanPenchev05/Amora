package config

import "time"

type JWTConfig struct {
	AccessSecret  string        `env:"JWT_ACCESS_SECRET" envDefault:"zKpMMHAdC1usbIKsAN+hcCcYphCSEbaGbeTxrMp7FdGPawG/fcTYW7AN4DWE"`
	RefreshSecret string        `env:"JWT_REFRESH_SECRET" envDefault:"ZyvKYcPgNtxkNMqX8bf9TCL4gF1Chl2JhKES9iUvkIEN52/Ty32DlrsEW10+"`
	AccessTTL     time.Duration `env:"JWT_ACCESS_EXPIRY" envDefault:"15m"`
	RefreshTTL    time.Duration `env:"JWT_REFRESH_EXPIRY" envDefault:"168h"`
	Issuer        string        `env:"JWT_ISSUER" envDefault:"viki-api"`
	Audience      string
}
