# reiter-osteopathie.de

## Gulp Tasks

run a webserver : gulp webserver = http://localhost:8000/
after changing a css, js File the page will reloaded.

```
$ livereload help

  Usage: livereload [options]

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
    -n, --no-browser  do not open the localhost server in a browser
    -l, --log [type]  log level (default: info)
    -p, --port <n>    the port to run on
```
more Info under: https://github.com/hiddentao/gulp-server-livereload


build the site  : gulp build
It will minify and concat css, js and minify html
webapp is the destination Folder

## Apache Config or .htaccess

use the following code in a .htaccess file or change the Apache config

```
<IfModule mod_mime.c>

  # Data interchange

    AddType application/atom+xml                        atom
    AddType application/json                            json map topojson
    AddType application/ld+json                         jsonld
    AddType application/rss+xml                         rss
    AddType application/vnd.geo+json                    geojson
    AddType application/xml                             rdf xml


  # JavaScript

    # Normalize to standard type.
    # https://tools.ietf.org/html/rfc4329#section-7.2

    AddType application/javascript                      js


  # Manifest files

    # If you are providing a web application manifest file (see
    # the specification: https://w3c.github.io/manifest/), it is
    # recommended that you serve it with the `application/manifest+json`
    # media type.
    #
    # Because the web application manifest file doesn't have its
    # own unique file extension, you can set its media type either
    # by matching:
    #
    # 1) the exact location of the file (this can be done using a
    #    directive such as `<Location>`, but it will NOT work in
    #    the `.htaccess` file, so you will have to do it in the main
    #    server configuration file or inside of a `<VirtualHost>`
    #    container)
    #
    #    e.g.:
    #
    #       <Location "/.well-known/manifest.json">
    #           AddType application/manifest+json               json
    #       </Location>
    #
    # 2) the filename (this can be problematic as you will need to
    #    ensure that you don't have any other file with the same name
    #    as the one you gave to your web application manifest file)
    #
    #    e.g.:
    #
    #       <Files "manifest.json">
    #           AddType application/manifest+json               json
    #       </Files>

    AddType application/x-web-app-manifest+json         webapp
    AddType text/cache-manifest                         appcache


  # Media files

    AddType audio/mp4                                   f4a f4b m4a
    AddType audio/ogg                                   oga ogg opus
    AddType image/bmp                                   bmp
    AddType image/svg+xml                               svg svgz
    AddType image/webp                                  webp
    AddType video/mp4                                   f4v f4p m4v mp4
    AddType video/ogg                                   ogv
    AddType video/webm                                  webm
    AddType video/x-flv                                 flv

    # Serving `.ico` image files with a different media type
    # prevents Internet Explorer from displaying then as images:
    # https://github.com/h5bp/html5-boilerplate/commit/37b5fec090d00f38de64b591bcddcb205aadf8ee

    AddType image/x-icon                                cur ico


  # Web fonts

    AddType application/font-woff                       woff
    AddType application/font-woff2                      woff2
    AddType application/vnd.ms-fontobject               eot

    # Browsers usually ignore the font media types and simply sniff
    # the bytes to figure out the font type.
    # https://mimesniff.spec.whatwg.org/#matching-a-font-type-pattern
    #
    # However, Blink and WebKit based browsers will show a warning
    # in the console if the following font types are served with any
    # other media types.

    AddType application/x-font-ttf                      ttc ttf
    AddType font/opentype                               otf


  # Other

    AddType application/octet-stream                    safariextz
    AddType application/x-bb-appworld                   bbaw
    AddType application/x-chrome-extension              crx
    AddType application/x-opera-extension               oex
    AddType application/x-xpinstall                     xpi
    AddType text/vcard                                  vcard vcf
    AddType text/vnd.rim.location.xloc                  xloc
    AddType text/vtt                                    vtt
    AddType text/x-component                            htc

</IfModule>


# Deflate Compression by FileType
<IfModule mod_deflate.c>
 AddOutputFilterByType DEFLATE text/plain
 AddOutputFilterByType DEFLATE text/html
 AddOutputFilterByType DEFLATE text/xml
 AddOutputFilterByType DEFLATE text/css
 AddOutputFilterByType DEFLATE text/javascript
 AddOutputFilterByType DEFLATE application/xml
 AddOutputFilterByType DEFLATE application/xhtml+xml
 AddOutputFilterByType DEFLATE application/rss+xml
 AddOutputFilterByType DEFLATE application/atom_xml
 AddOutputFilterByType DEFLATE application/javascript
 AddOutputFilterByType DEFLATE application/x-javascript
 AddOutputFilterByType DEFLATE application/x-shockwave-flash
 AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>


# ----------------------------------------------------------------------
# | Expires headers                                                    |
# ----------------------------------------------------------------------

# Serve resources with far-future expires headers.
#
# (!) If you don't control versioning with filename-based
# cache busting, you should consider lowering the cache times
# to something like one week.
#
# https://httpd.apache.org/docs/current/mod/mod_expires.html

<IfModule mod_expires.c>

    ExpiresActive on
    ExpiresDefault                                      "access plus 1 month"

  # CSS
    ExpiresByType text/css                              "access plus 1 year"

  # Data interchange
    ExpiresByType application/atom+xml                  "access plus 1 hour"
    ExpiresByType application/rdf+xml                   "access plus 1 hour"
    ExpiresByType application/rss+xml                   "access plus 1 hour"

    ExpiresByType application/json                      "access plus 0 seconds"
    ExpiresByType application/ld+json                   "access plus 0 seconds"
    ExpiresByType application/schema+json               "access plus 0 seconds"
    ExpiresByType application/vnd.geo+json              "access plus 0 seconds"
    ExpiresByType application/xml                       "access plus 0 seconds"
    ExpiresByType text/xml                              "access plus 0 seconds"

  # Favicon (cannot be renamed!) and cursor images
    ExpiresByType image/vnd.microsoft.icon              "access plus 1 week"
    ExpiresByType image/x-icon                          "access plus 1 week"

  # HTML
    ExpiresByType text/html                             "access plus 0 seconds"

  # JavaScript
    ExpiresByType application/javascript                "access plus 1 year"
    ExpiresByType application/x-javascript              "access plus 1 year"
    ExpiresByType text/javascript                       "access plus 1 year"

  # Manifest files
    ExpiresByType application/manifest+json             "access plus 1 year"

    ExpiresByType application/x-web-app-manifest+json   "access plus 0 seconds"
    ExpiresByType text/cache-manifest                   "access plus 0 seconds"

  # Media files
    ExpiresByType audio/ogg                             "access plus 1 month"
    ExpiresByType image/bmp                             "access plus 1 month"
    ExpiresByType image/gif                             "access plus 1 month"
    ExpiresByType image/jpeg                            "access plus 1 month"
    ExpiresByType image/png                             "access plus 1 month"
    ExpiresByType image/svg+xml                         "access plus 1 month"
    ExpiresByType image/webp                            "access plus 1 month"
    ExpiresByType video/mp4                             "access plus 1 month"
    ExpiresByType video/ogg                             "access plus 1 month"
    ExpiresByType video/webm                            "access plus 1 month"

  # Web fonts

    # Embedded OpenType (EOT)
    ExpiresByType application/vnd.ms-fontobject         "access plus 1 month"
    ExpiresByType font/eot                              "access plus 1 month"

    # OpenType
    ExpiresByType font/opentype                         "access plus 1 month"

    # TrueType
    ExpiresByType application/x-font-ttf                "access plus 1 month"

    # Web Open Font Format (WOFF) 1.0
    ExpiresByType application/font-woff                 "access plus 1 month"
    ExpiresByType application/x-font-woff               "access plus 1 month"
    ExpiresByType font/woff                             "access plus 1 month"

    # Web Open Font Format (WOFF) 2.0
    ExpiresByType application/font-woff2                "access plus 1 month"

  # Other
    ExpiresByType text/x-cross-domain-policy            "access plus 1 week"

</IfModule>


<IfModule mod_headers.c>
	Header set X-Content-Type-Options "nosniff"
 <filesmatch "\\.(ico|jpe?g|png|gif|swf)$">
  Header set Cache-Control "max-age=2592000, public"
 </filesmatch>
 <filesmatch "\\.(css)$">
  Header set Cache-Control "max-age=604800, public"
 </filesmatch>
 <filesmatch "\\.(js)$">
  Header set Cache-Control "max-age=216000, private"
 </filesmatch>
</IfModule>

# ----------------------------------------------------------------------
# | ETags                                                              |
# ----------------------------------------------------------------------

# Remove `ETags` as resources are sent with far-future expires headers.
#
# https://developer.yahoo.com/performance/rules.html#etags
# https://tools.ietf.org/html/rfc7232#section-2.3

# `FileETag None` doesn't work in all cases.
<IfModule mod_headers.c>
    Header unset ETag
</IfModule>

# Deflate Compression by MimeType
<IfModule mod_deflate.c>
 <FilesMatch "\.(js|jpg|jpeg|gif|png|css)$">
  ExpiresActive on
  ExpiresDefault "access plus 1 month"
  SetOutputFilter DEFLATE
 </FilesMatch>
</IfModule>


# 480 weeks
<FilesMatch "\.(ico|pdf|flv|jpg|jpeg|png|gif|js|css|swf)$">
Header set Cache-Control "max-age=290304000, public"
</FilesMatch>

# 2 HOURS
<FilesMatch "\.(html|htm)$">
Header set Cache-Control "max-age=7200, must-revalidate"
</FilesMatch>
```
