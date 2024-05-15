// Dashboard.tsx
import React, { useState } from "react";
import StarRatings from "react-star-ratings";
import { BlockData } from "@/utils/interfaces";

interface DashboardProps {
  boughtVNFs: BlockData[];
}

const Dashboard: React.FC<DashboardProps> = ({ boughtVNFs }) => {
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  // Function to handle rating submission
  const handleRateVNF = (vnfId: string, rating: number) => {
    // Implement logic to submit rating for the selected VNF
    console.log(`Rated VNF '${vnfId}' with rating ${rating}`);
    setRatings({ ...ratings, [vnfId]: rating });
  };

  return (
    <div>
      <h2>My Bought VNFs</h2>
      {boughtVNFs.map((vnf) => (
        <div key={vnf.id}>
          <h3>{vnf.vnfName}</h3>
          <p>Description: {vnf.description}</p>
          <p>Price: {vnf.vnfprice}</p>
          {/* Display rating form if not already rated */}
          {!ratings[vnf.id] && (
            <div>
              <StarRatings
                rating={ratings[vnf.id] || 0}
                starRatedColor="orange"
                changeRating={(rating) => handleRateVNF(vnf.id, rating)}
                numberOfStars={5}
                name={`rating_${vnf.id}`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
