import { useEffect, useState } from "react";


const menuItems = [
  "Home",
  "Subscribes",
  "My Content",
  "History",
  "Collections",
  "Profile",
];

function SideBar() {

  const [activeSection, setActiveSection] = useState("Home");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await fetch(
        "https://your-api.com/videos"
      );

      const data = await response.json();
      console.log(data);
      setVideos(data);
    };

    if (activeSection === "Home") {
      fetchVideos();
    }
  }, [activeSection]);

  return (
    <div className="flex bg-black min-h-screen text-white">

      {/* Sidebar */}
      <div className="w-62.5 border-r border-pink-500 p-4">
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`p-3 rounded-lg border transition
        ${activeSection === item
                  ? "bg-pink-500 border-pink-500"
                  : "border-gray-600 hover:border-pink-500"
                }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5">
        <div>
          {activeSection === "Home" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Home Videos
              </h1>

              <div className="grid grid-cols-3 gap-4">
                {videos.map((video: any) => (
                  <div
                    key={video.id}
                    className="border border-gray-700 p-3 rounded-lg"
                  >
                    <img
                      src={video.thumbnail}
                      alt=""
                      className="rounded-lg"
                    />

                    <h2 className="mt-2 font-semibold">
                      {video.title}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "Subscribes" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Subscribed Channels
              </h1>

              <p>Your subscribed channels appear here.</p>
            </div>
          )}

          {activeSection === "My Content" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                My Content
              </h1>

              <p>Your uploaded content appears here.</p>
            </div>
          )}

          {activeSection === "History" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Watch History
              </h1>

              <p>History appears here.</p>
            </div>
          )}

          {activeSection === "Collections" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Collections
              </h1>

              <p>Collections appear here.</p>
            </div>
          )}

          {activeSection === "Profile" && (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Profile
              </h1>

              <p>Profile details appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SideBar
