# pdf2cbt
## Turn PDF of questions into CBT (Computer Based Test)

You can build the project for offline use by following these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/TheMoonVyy/pdf2cbt.git
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Generate Static Webpage Files
```bash
npm run generate
```
This will generate static files to .output/public folder.
After generating the files, you can use any simple HTTP server to host it locally.
### Example 1: Using npx server
```bash
npx serve .output/public
```
### Example 2: Using Python HTTP Server
```bash
cd .output/public
python3 -m http.server
```
