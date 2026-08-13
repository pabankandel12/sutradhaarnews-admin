export const menu = [
  ["ड्यासबोर्ड", "/", "gauge"], ["समाचार", "/articles", "newspaper"], ["नयाँ समाचार", "/articles/new", "pen"],
  ["सम्पादकीय समीक्षा", "/review", "check"], ["गृहपृष्ठ", "/homepage", "home"], ["श्रेणी", "/categories", "folder"],
  ["मिडिया", "/media", "image"], ["प्रतिक्रिया", "/comments", "comments"], ["विज्ञापन", "/ads", "rectangle-ad"], ["प्रयोगकर्ता", "/users", "users"],
];
export const demoArticles = [
  { id:"1", title:"नयाँ आर्थिक वर्षको प्राथमिकता: उत्पादन र रोजगारीमा जोड", category:"समाचार", author:"राम प्रसाद", status:"IN_REVIEW", updated:"१२ मिनेट अगाडि" },
  { id:"2", title:"लगानीमैत्री वातावरण बनाउन निजी क्षेत्रको आग्रह", category:"अर्थ", author:"सीता कार्की", status:"DRAFT", updated:"३२ मिनेट अगाडि" },
  { id:"3", title:"युवा टोलीको शानदार जित, फाइनल यात्रा सुनिश्चित", category:"खेलकुद", author:"अनिल श्रेष्ठ", status:"PUBLISHED", updated:"१ घण्टा अगाडि" },
  { id:"4", title:"स्थानीय तहमा डिजिटल सेवा विस्तार हुँदै", category:"प्रदेश", author:"गीता थापा", status:"CHANGES_REQUESTED", updated:"२ घण्टा अगाडि" },
];
export const statusLabel: Record<string,string> = { DRAFT:"मस्यौदा", IN_REVIEW:"समीक्षामा", CHANGES_REQUESTED:"सुधार आवश्यक", APPROVED:"स्वीकृत", SCHEDULED:"तालिकाबद्ध", PUBLISHED:"प्रकाशित", ARCHIVED:"अभिलेख" };
