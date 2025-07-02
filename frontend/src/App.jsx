import { useState } from "react";

function App() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  //const [heading, setHeading] = useState("");

  //const generateText = async (prompt) => {
  //SAVE RESPONSE TO A TEXT FILE..
  //Download textfile to the user's computer
  //Function to downoad text as a file
  const downloadAsTextFile = () => {
    if (!generatedText) {
      alert("No text file to save!");
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `gemini-response-${timestamp}.txt`;

    const content = `Generated Response:\n${generatedText}\n\nGenerated on: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to save to server
  const saveToServer = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort, 300000;
    });

    if (!generatedText) {
      alert("No file to save to server!");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/save-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          generatedText,
          timestamp: new Date().toISOString(),
          signal: controller.signal, //adding this for timeout
        }),
      });
      //clear timeoutId
      clearTimeout(timeoutId);
      // Wait for the data
      const data = await response.json();
      if (response.ok) {
        alert(`File saved successfully, ${data.filename}`);
      } else {
        alert(`Error saving file, ${data.error}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      alert(`Error saving file to server!", ${err.message}`);
      if (error.name == "AbortError") {
        throw new Error("Request timed out!");
      }
      throw error;
    }
  };
  //generate-text
  const generateText = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ prompt, maxTokens: 1000000, temperature: 0.7 }),
      });

      const data = await response.json();
      console.log("response in the front end:", response);
      console.log("data in the front end:", data);
      if (response.ok) {
        console.log("response in the frontend is:", response);
      } else {
        throw new Error(data.error || "Failed to generate Text");
      }
      //setResponse(data.text);
      if (data.success && data.text) {
        console.log("The generatedText is from front end:", data.text);
        //setGeneratedText(data.text);
      } else {
        throw new Error("No text was generated");
      }
      setGeneratedText(data.text);
      console.log("generatedText in console:", response);
      //split the original  text & generated text
      //setResponse(data.candidates?.[0]?.content?.parts?.[0]?.text);
      setResponse(data.response);
      console.log("data.fullResponse:", data.response);
      //setResponse(data.text);
      console.log("response after reading data", data.text);
    } catch (error) {
      console.error("Error:", error);
      //setResponse("Error generating text");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prompt = e.target.prompt.value;
    if (prompt.trim()) {
      generateText(prompt);
    }
  };
  //clear the content in the clearAll button
  const clearAll = () => {
    setGeneratedText(" ");
    setPrompt(" ");
    setError(" ");
  };
  console.log("prompt.length:", prompt.length);
  console.log("generatedText length:", generatedText.length);
  return (
    <div>
      {/* <form onSubmit={handleSubmit}>
        <input name="prompt" placeholder="Enter your prompt" />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>
      </form> */}
      {/*<form onSubmit={handleSubmit}>*/}
      <h1> Transcribe Text</h1>
      <p className="heading">
        This is an app to use Gemini AI Model gemini-2.0-flash-lite to
        Transcribe Text and save it to a file or many files. The text is
        Transcribed court style, Verbatim and each speaker is separated into a
        different paragraph
      </p>
      <h3>Enter your prompt below</h3>
      {/* <input className="input-section" /> */}
      <label id="promptLbl" htmlFor="prompt">
        Enter your prompt:
      </label>
      <textarea
        id="promptTxtArea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What would you like Gemini to write about?"
        rows={4}
      />

      <button className="gen-btn" onClick={generateText} disabled={loading}>
        {loading ? "Generating..." : "Generate Text"}
      </button>
      {/*Clear the tetxarea*/}
      <button
        onClick={() => {
          clearAll();
        }}
        className="clear-btn"
      >
        Clear All
      </button>
      {/* Generated Display*/}
      {generatedText && (
        <div className="result">
          <h3>Generated Text:</h3>
          <div className="genRes">
            Generated text is shown here: {generatedText}
          </div>
          {/* Save Buttons*/}
          <div className="save-button">
            <button onClick={downloadAsTextFile} className="download-btn">
              Save to Server
            </button>
          </div>
          <button
            className="clipB-btn"
            onClick={() => navigator.clipboard.writeText(response)}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
