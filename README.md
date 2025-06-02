# pdf2cbt
## Turn PDF of questions into CBT (Computer Based Test)

You can use offline version of this project by following these steps:

### 1. Download the pdf2cbt.zip file
Go to the [Releases](https://github.com/TheMoonVyy/pdf2cbt/releases/latest) section and download the `pdf2cbt.zip` file.

### 2. Extract the Zip
Unzip the file anywhere on your system.

### 3. cd to extracted folder
Open your terminal and change its current working directory to the extracted pdf2cbt.zip file contents (NOTE: contents i.e. index.html, cbt, pdf-cropper, \_nuxt etc  are inside the pdf2cbt folder).
```shell
cd path/to/extracted/pdf2cbt/contents
```
### 3. Start a Local Simple HTTP Server
You will require a simple HTTP server like for example `npx serve` (requires npm to be installed) or python's `http server` (requires python to be installed).

Below in both options `PORT` is the port number your local website will run on, for example 2025 or 8080 or 3000.
It is recommended to always use the same `PORT` so that settings, test data etc can persist in your local drive via browser.

#### Option 1: Using `npx serve`
```shell
npx serve -l PORT
# example with port: npx serve -l 2025
# if it asks for installing serve, then press y and enter to install it
# or you can install the package itself using `npm install serve` use a `-g` flag to install it globally on your system and then use `serve -l PORT`
```

### Option 2: Using Python HTTP Server
```shell
python -m http.server PORT
# example with port: python -m http.server 2025
# it may be called python or python3 so try both if you are sure it is installed
```

Command output will have the location (link/url) at which the server is being served, just open that link in your browser to use the local website.
