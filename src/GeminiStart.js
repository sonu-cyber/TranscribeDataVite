const GeminiStart = () => {
  async function testAPI() {
    const apiKey = VITE_GEMINI_API_KEY; // Replace with your actual key
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "Testing...";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
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
                    text: "Give me this text in court style, verbatim &  each speaker in separate paragraphs.:Good Mornning ! The way that those sites have been developed an enforcement of the bylaw by notallowing the use would constitute a hardship the hardship for Suzette is pretty clear she wouldn't be able to puther business there and she's been looking for a site to locate in Shrewsbury for an extended period oftime that works for the ease of customers to be able to find it and be able to take care of a geographicdistance people are willing to travel the site has developed through other applications to this board and to theplanning board into a mixed-use type of development it has active indoor recreation in the rear of the buildingit has other types of retail or businesses that people come and go to ona regular basis and therefore trying to find a use that would meet the requirements would would be difficultfor the owner relief can be granted without substantial detriment to the public goodthis board has in these situations granted such relief at this site and by way of example at 9 10 Boston Turnpikedown the road without any detriment to the public good in that there's no largetraffic that travels to or from the site that adds to the burden on Route 9 asSuzette indicated she has eight patrons on a 50-minute schedule so it doesn't tax either the site in any fashion orotherwise and it can also be granted without nullifying a substantially derogating from the purpose of thevariance is required the bylaw does permit that in theseparticular cases and these unique circumstances and we think those requirements are met here and so we",
                  },
                ],
              },
            ],

            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      console.log("response:", response);

      const data = await response.json();
      console.log("data:", data);

      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        //resultDiv.innerHTML = `<h3>Success!</h3><p>${text}</p>`;

        <div>
          {/* <h3>Success!</h3> */}
          <p>{text}</p>
        </div>;
      } else {
        /* resultDiv.innerHTML = `<h3>Error:</h3><p>${JSON.stringify(
          data,
          null,
          2
        )}</p>`; */
        {
          <div>
            <h3>
              Error:<p>${JSON.stringify(data, null, 2)}</p>
            </h3>
          </div>;
        }
      }
    } catch (error) {
      resultDiv.innerHTML = `<h3>Error:</h3><p>${error.message}</p>`;
    }
  }
  apiTest();
};

export default GeminiStart;
