import { useEffect, useState } from "react";
import {io} from "socket.io-client";
import axios from "axios";

const socket=io("http://localhost:5000");

function ForecastPage(){
    const[forecast,setForecast]=useState([]);
    const[loading,setLoading]=useState(true);

    const fetchForecasts=async()=>{
        try{
            const response=await axios.get(
                "http://localhost:5000/api/forecast"
            );
            setForecast(response.data);
        }catch(error){
            console.error(
                "Error fetching forecasts",
                error
            );
        }finally{
            setLoading(false);
        }
    };

   useEffect(() => {

    const loadForecasts = async () => {

        await fetchForecasts();

    };

    loadForecasts();

}, []);
    useEffect(()=>{
        socket.on("forecastUpdated",(data)=>{
            console.log("Realtime Forecast Update",data);

            setForecast(data);
        });

        return()=>{
            socket.off("forecastUpdated");
        }
    },[]);

    const runForecast=async()=>{
        try{
            await axios.post(
                "http://localhost:5000/api/forecast/run"
            );
            alert("Forecast generation started");
        }catch(error){
            console.error(error)
        }
    };

    return(
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">AI Demand Forecasting</h1>

                <button
                    onClick={runForecast}
                    className="bg-black text-white px-4 py-2 rounded">
                        Run Forecast
                    </button>
            </div>
            
            {loading ? (
                <p>Loading forecasts...</p>
            ):(
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="border p-3">
                                    Product
                                </th>
                                <th className="border p-3">
                                    Branch
                                </th>
                                <th className="border p-3">
                                    Forecast Date
                                </th>
                                <th className="border p-3">
                                    Predicted Demand
                                </th>
                                  <th className="border p-3">
                                    Confidence
                                </th>
                                  <th className="border p-3">
                                    AI Insight
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            {forecast.length > 0 ? (

                                forecast.map((item) => (

                                    <tr key={item._id}>

                                        <td className="border p-3">
                                            {item.product?.name || "N/A"}
                                        </td>

                                        <td className="border p-3">
                                            {item.branch?.name || "N/A"}
                                        </td>

                                        <td className="border p-3">

                                            {
                                                new Date(
                                                    item.forecastDate
                                                ).toLocaleDateString()
                                            }

                                        </td>

                                        <td className="border p-3">
                                            {item.predictedDemand}
                                        </td>

                                        <td className="border p-3">
                                            {item.confidenceScore}%
                                        </td>

                                        <td className="border p-3">
                                            {item.aiInsight}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="text-center p-5"
                                    >
                                        No forecast data found
                                    </td>

                                </tr>

                            )}

                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
    
}

export default ForecastPage;