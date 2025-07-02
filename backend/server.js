import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

//import generateTextRoutes from "./routes/generateText";
const app = express();
dotenv.config();
const PORT = 5000;
const apiKey = process.env.VITE_GEMINI_API_KEY;
// Middleware
app.use(cors());
app.use(
  express.json({
    // allow large text uploads
    limit: "100mb",
  })
);

app.use(
  express.urlencoded({
    limit: "100mb",
    extended: true,
  })
);

//Set server timeout
const server = app.listen(3000, () => {
  console.log("Server running on port 5000");
});
server.timeout = 300000; //5 minutes
//app.use(dotenv.config());
//app.use("/api", generateTextRoutes);

//Create a dir if it doesnt exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const responsesDir = path.join(__dirname, "responses");
fs.mkdir(responsesDir, { recursive: true }).catch(console.error);
// Test routes
app.get("/", (req, res) => {
  console.log("GET  / called");
  res.json({ message: "Server is working!" });
});
// Gemini API route endpoint
app.post("/api/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      //`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-PRO:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100000,
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("data", data);
    } else {
      console.log("Could not generate data in the backend!");
    }
    //extract the text & return data;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("generatedText in the backend:", generatedText);

    //send the text back to the front end
    res.json({
      success: true,
      text: generatedText,
      fullResponse: data,
    });
    //console.log(generatedText);
    return generatedText;
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

// Test routes
app.get("/", (req, res) => {
  console.log("GET  for saving filename / called");
  res.json({ message: "Server is working!" });
});

//New endpoint to save response to server
app.post("/api/save-response", async (req, res) => {
  try {
    //set request timeout
    req.setTimeout(300000);
    const { prompt, generatedText, timestamp } = req.body;
    console.log("prompt:", prompt);
    console.log("timestamp:", timestamp);
    console.log("generatedText:", generatedText);

    if (!prompt || !generatedText) {
      return response
        .status(400)
        .json({ error: "Prompt and generatedText are required" });
    }

    //Create filename with timestamp
    //const date = new Date(timestamp || Date.now());
    console.log("date:", date);
    const filename = `gemini-response-.replace(/[:.]/g, "-")}.txt`;
    const filepath = path.join(responsesDir, filename);

    //Create file content
    /* const content = `Prompt:${prompt}
    Generated Response: ${response}
    Generated on: ${date.toLocaleString()}
    Timestamp:${date.toISOString()} 
    `; */

    //Create file content
    const content = `Prompt:${prompt}
    Generated Response: ${response} 
    `;

    //Write File to server
    await fs.writeFile(filepath, content, "utf8");
    //fs.writeFileSync('output.txt', text, 'utf8');
    console.log(`File saved to: ${filepath}`);

    res.json({
      sucess: true,
      filename: filename,
      message: "response saved successfully",
    });
    console.log("filename is :", res.json(filename));
  } catch (err) {
    console.log("Error saving file", err);
    res.status(500).json({ err: "Failed to save file: " + err.message });
  }
});

// Optional: Endpoint to list saved files
app.get("/api/saved-files", async (req, res) => {
  try {
    const files = await fs.readdir(responsesDir);
    const textFiles = files.filter((file) => file.endsWith(".txt"));

    const fileDetails = await Promise.all(
      textFiles.map(async (file) => {
        const filepath = path.join(responsesDir, file);
        const stats = await fs.stat(filepath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
    );
    fs.stat("file.txt", function (err, stat) {
      if (err == null) {
        console.log("File exists");
      } else {
        console.log("Some other error: ", err.code);
      }
    });

    res.json({ files: fileDetails });
  } catch (error) {
    res.status(500).json({ error: "Failed to list files: " + error.message });
  }
});

//Optional endpoint to download file saved

app.get("api/download/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(responsesDir, filename);
    //check if file exists
    await fs.access(filepath);
    console.log("filepath is :", filepath);
    res.download(filepath, filename);
  } catch (error) {
    console.status(404).json({ error: "File not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Responses will be saved to: ${responsesDir}`);

  //console.log("- API Key loaded:", process.env.VITE_GEMINI_API_KEY);
});
