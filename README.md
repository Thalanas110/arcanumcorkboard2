# Arcanum Corkboard III - Setup Guide

Welcome! This guide is designed to help you set up this website on your own computer, even if you have never done any programming before. Just follow these steps one by one.

## 1. Preparation (Download Tools)

Before we start, you need two free tools installed on your computer:

1.  **Git**: This allows you to download the project code.
    *   Download here: [git-scm.com/downloads](https://git-scm.com/downloads)
    *   *Tip: Just click "Next" through all the installation options; the default settings are fine.*

2.  **Node.js**: This is the engine that runs the website code.
    *   Download here: [nodejs.org](https://nodejs.org/)
    *   *Tip: Download the "LTS" (Long Term Support) version. Like Git, just click "Next" through the installer.*

## 2. Download the Project

1.  Create a new folder on your computer where you want this project to live (e.g., on your Desktop called "MyWebsite").
2.  Open that folder.
3.  Right-click inside the blank space of the folder and select **"Open Git Bash Here"** (if you are on Windows) or **"Open Terminal Here"** (if you comprise Mac/Linux).
    *   *A black window with text will appear. This is the "Terminal". You will type commands here.*
4.  Copy the following command, paste it into that black window, and press **Enter**:
    ```bash
    git clone https://github.com/Thalanas110/arcanumcorkboard2.git
    ```
5.  Wait for it to finish. You should now see a new folder called `arcanumcorkboard2` inside your folder.
6.  In your terminal window, type this command and press **Enter** to "go into" that new folder:
    ```bash
    cd arcanumcorkboard2
    ```

## 3. Install Dimensions

Now we need to download all the little pieces of code (libraries) that make the website work.

1.  In the same terminal window, type this and press **Enter**:
    ```bash
    npm install
    ```
    *   *This might take a minute or two. You will see a lot of text scrolling by. As long as it doesn't say "ERROR" in big red letters at the very end, you are good.*

## 4. Create the Database (Supabase)

The website uses **Supabase** to store data. You need to create your own database for free.

1.  Go to [supabase.com](https://supabase.com/) and click **"Start your project"**.
2.  Sign up (or log in).
3.  Click **"New Project"**.
4.  Fill in the details:
    *   **Name**: Anything you want (e.g., "My Corkboard").
    *   **Password**: Create a strong password (you usually won't need this again, but save it).
    *   **Region**: Choose the one closest to you.
5.  Click **"Create new project"** and wait a minute for it to set up.

### Set up the Tables (The Data Structure)
We need to tell the database how to store our information.
1.  In your Supabase dashboard, look at the left sidebar and click the **"SQL Editor"** icon (it looks like a terminal/code page).
2.  Click **"New Query"** (blank page).
3.  Now, on your computer, open the `arcanumcorkboard2` folder you downloaded.
4.  Go into `supabase` -> `migrations`. You will see two files ending in `.sql`.
5.  **File 1**: Open the first file (starts with `2025...`) with Notepad. Copy **ALL** the text. Paste it into the Supabase box on the website. Click **"Run"** (bottom right).
    *   *It should say "Success".*
6.  **File 2**: Delete the text in the box (or make a new query). Open the second file (starts with `2026...`) with Notepad. Copy/Paste/Run it just like the first one.

## 5. Connect the Database (Important!)

This website needs to connect to a database to work. We use a file called `.env` to store the secret keys for that connection.

1.  Look in the project folder for a file named `.env.example`.
2.  **Copy** that file and **Paste** it in the same folder.
3.  Rename the *copy* to just `.env` (remove the `.example` part and the "copy" part).
    *   *Note: Your computer might ask if you are sure you want to change the file extension. Say Yes.*
4.  **Get your keys**:
    *   Go to your Supabase project dashboard.
    *   Click the **Settings** (cogwheel icon) at the bottom left.
    *   Click **API** in the side menu.
    *   You will see your `Project URL` and `anon public` key. Keep this tab open.
5.  Open the new `.env` file with any text editor (Notepad, TextEdit, etc.).
6.  You will see three lines that look like `KEY="value"`. Replace the `value` parts with the keys you just found:
    ```env
    VITE_SUPABASE_PROJECT_ID="your_project_ref_id"
    VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_public_key"
    VITE_SUPABASE_URL="your_project_url"
    ```
    *   *Note: `PROJECT_ID` is the random text part of your URL (e.g., if URL is `https://abcdef.supabase.co`, ID is `abcdef`).*
7.  **Save** the file and close it.

## 6. Run the Website

You are ready!

1.  Go back to your terminal window (black screen).
2.  Type this command and press **Enter**:
    ```bash
    npm run dev
    ```
3.  You should see text saying the server started, and a link like `http://localhost:5173`.
4.  **Hold "Ctrl"** (or Cmd on Mac) and **Click** that link.
    *   Or, just open your web browser (Chrome, Edge, etc.) and type `http://localhost:5173` in the address bar.

**Result:** You should now see the website running on your computer!

## 7. Deploy to the Internet (Netlify)

If you want to put this website on the internet so others can see it, follow these steps to use **Netlify**.

### Step 1: Install the Netlify Tool
1.  Open your terminal (Stop the server with `Ctrl + C` if it is still running).
2.  Type this command and press **Enter**:
    ```bash
    npm install netlify-cli -g
    ```
    *   *If you get a permission error on Mac/Linux, try `sudo npm install netlify-cli -g` and enter your password.*

### Step 2: Login
1.  Type this command and press **Enter**:
    ```bash
    netlify login
    ```
2.  A browser window will open. Click **"Authorize"** to let the tool connect to your Netlify account (create one if you don't have one).

### Step 3: Deployment
1.  First, make sure we have the latest version of the site ready. Type:
    ```bash
    npm run build
    ```
2.  Now, let's put it online. Type:
    ```bash
    netlify deploy --prod
    ```
3.  The terminal will ask you a few questions. Use your arrow keys to select, and Enter to confirm:
    *   **What would you like to do?** -> Select **"Create & configure a new site"**
    *   **Team?** -> Select your name/team.
    *   **Site name?** -> You can leave this blank (press Enter) for a random name, or type a unique name.
    *   **Publish directory?** -> **IMPORTANT:** Type `dist` and press Enter.

### Step 4: Add Secret Keys
Your website won't work yet because the secret database keys are missing on the internet version.
1.  In your terminal, type this command to automatically send your local keys to Netlify:
    ```bash
    netlify env:import .env
    ```
2.  **Done!** You should see a "Website Draft URL" or "Live URL" in the terminal. Copy and paste that into your browser.

---

## Troubleshooting

-   **"Command not found"**: This usually means Git, Node.js, or Netlify CLI didn't install correctly. Try restarting your computer.
-   **Red Errors during npm install**: Check your internet connection and try running `npm install` again.
-   **Website is blank**: Open the "Inspector" in your browser (Right click -> Inspect -> Console tab) to see if there are errors related to the `.env` keys.
