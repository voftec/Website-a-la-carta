/* Reference videos + short effect descriptions for the AR filter modules.
   Kept outside modules.js so CSV import/export never touches them. */
window.AR_MEDIA = {
  ar_face: {
    camera: "Front camera",
    what: "Face tracking: the filter locks onto the fan's face and follows every movement - glasses, hats, masks, makeup, glowing eyes or particles that react when they smile or open their mouth. Perfect for selfies and 15s videos to share on TikTok / IG.",
    videos: [
      { src: "media/ar/face-1.mp4", label: "Face filter - reference 1", effect: "Reference 1 - face-tracked effect" },
      { src: "media/ar/face-2.mp4", label: "Face filter - reference 2", effect: "Reference 2 - face-tracked effect" }
    ]
  },
  ar_world: {
    camera: "Back camera",
    what: "World tracking: the fan points the back camera at the floor or a table and the artist, a stage or an object appears in their real space. They can walk around it, get closer, record and share.",
    videos: [
      { src: "media/ar/world-1.mp4", label: "World AR - reference 1", effect: "Reference 1 - object anchored in the real world" },
      { src: "media/ar/world-2.mp4", label: "World AR - reference 2", effect: "Reference 2 - object anchored in the real world" }
    ]
  },
  ar_marker: {
    camera: "Back camera",
    what: "Image tracking: the camera recognises a printed image - album cover, poster, ticket or t-shirt - and an animation, video or 3D scene plays anchored to it. Great for physical merch and out-of-home.",
    videos: []
  }
};
