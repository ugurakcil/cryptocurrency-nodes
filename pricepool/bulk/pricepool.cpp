#include <iostream>
#include <string>
#include <thread>
#include <chrono>
#include <curl/curl.h>
#include "rapidjson/document.h"
#include "rapidjson/writer.h"

#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>

#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>

using namespace std;
using namespace rapidjson;
using namespace std::chrono;

#define MONGOURI "mongodb://root:lion@localhost/?authSource=admin"
#define INTERVALONEFORGE 10

static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
{
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

string timeStampToHReadble(const time_t rawtime)
{
    struct tm * dt;
    char buffer [30];
    dt = localtime(&rawtime);
    strftime(buffer, sizeof(buffer), " %H:%M:%S %d/%m/%Y", dt);
    return std::string(buffer);
}

void oneforge()
{
    mongocxx::instance instance{};
    mongocxx::uri uri(MONGOURI);
    mongocxx::client client(uri);
    
    CURL *curl;
    CURLcode res;
    std::string readBuffer;

    Document document;

    while(true){
        std::this_thread::sleep_for(std::chrono::seconds(INTERVALONEFORGE));
        //auto start = high_resolution_clock::now();

        std::vector<bsoncxx::document::value> mongoDocs;

        curl = curl_easy_init();

        /*
        bsoncxx::stdx::optional<bsoncxx::document::value> maybe_result = 
            dailyCollection.find_one(
                bsoncxx::builder::stream::document{} 
                << "$natural" << -1 
                << bsoncxx::builder::stream::finalize
            );
        
        if(maybe_result) {
            std::cout << bsoncxx::to_json(*maybe_result) << "\n";
        } else {
            cout << "Kayıt yok";
        }
        */

        /*
        auto dailyCollection = client["pricepool"]["test"];

        auto order = bsoncxx::builder::stream::document{} << "created_at" << -1 << bsoncxx::builder::stream::finalize;

        auto opts = mongocxx::options::find{};
        opts.sort(order.view());

        bsoncxx::stdx::optional<bsoncxx::document::value> maybe_result = dailyCollection.find_one({}, opts);
            
        if(maybe_result) {
            cout << "CURSOR :::::::::::::::::::::: " << bsoncxx::to_json(*maybe_result) << endl;
        } else {
            cout << "Kayıt yok !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
        }
        */

        if(curl) {
            curl_easy_setopt(curl, CURLOPT_URL, "https://forex.1forge.com/1.0.3/quotes?pairs=BTCUSD,BTCEUR,BTCJPY,BTCGBP,BTCTRY,ETHUSD,ETHEUR,ETHJPY,ETHGBP,ETHTRY,LTCUSD,LTCEUR,LTCJPY,LTCGBP,LTCTRY,XRPUSD,XRPEUR,XRPJPY,XRPGBP,XRPTRY,USDTRY,EURBTC,USDBTC,ETHBTC,LTCBTC,XRPBTC,TRYBTC,EURTRY,USDEUR,BCHTRY&api_key=HyWJyy31mercu9Hp6h18o3p0jxvznptq");
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
            res = curl_easy_perform(curl);
            curl_easy_cleanup(curl);

            document.Parse(readBuffer.c_str());

            for(size_t i=0; i < document.Size(); ++i) {
                /*
                cout << "Symbol : " << document[i]["symbol"].GetString()<< endl;
                cout << "Price : " << document[i]["price"].GetDouble()<< endl;
                cout << "Ask : " << document[i]["ask"].GetDouble()<< endl;
                cout << "Bid : " << document[i]["bid"].GetDouble()<< endl;
                cout << "Timestamp : " << document[i]["timestamp"].GetInt() << endl;
                cout << "Time : " << timeStampToHReadble(document[i]["timestamp"].GetInt()) << endl;
                cout << "Ago 1 Minute : " << timeStampToHReadble( document[i]["timestamp"].GetInt() - (60 * 1) ) << endl;
                cout << "Yesterday : " << timeStampToHReadble( document[i]["timestamp"].GetInt() - (60 * 60 * 24) ) << endl;
                cout << "--------------------------------" << endl;
                */

                mongoDocs.push_back(
                    bsoncxx::builder::stream::document{} 
                    << "symbol" <<  document[i]["symbol"].GetString()
                    << "price" << document[i]["price"].GetDouble()
                    << "ask" << document[i]["ask"].GetDouble()
                    << "bid" << document[i]["bid"].GetDouble()
                    << "timestamp" << document[i]["timestamp"].GetInt()
                    << bsoncxx::builder::stream::finalize
                );
            }

            auto collection = client["pricepool"]["oneforge"];
            collection.insert_many(mongoDocs);
            
            /*auto cursor = collection.find({});
            
            for (auto&& doc : cursor) {
                std::cout << bsoncxx::to_json(doc) << std::endl;
            }
            */
        } // ./if-curl

        //auto stop = high_resolution_clock::now(); 
        //auto duration = duration_cast<microseconds>(stop - start);
        //std::cout << "Time taken oneforge: " << duration.count() << std::endl;
    } // ./while-true
}

int main(int argc, char *args[])
{
    std::thread threadOneForge(oneforge);
    threadOneForge.join();

    return 0;
}

// g++ pricepool.cpp -o pricepool -lcurl -lpthread $(pkg-config --cflags --libs libmongocxx) && ./pricepool

/*
g++ pricepool.cpp -o pricepool -lcurl -lpthread $(pkg-config --cflags --libs libmongocxx) -Wl,-rpath,/usr/local/lib
*/

/*
g++ pricepool.cpp -o pricepool -lcurl -lpthread \
-I/usr/local/include/mongocxx/v_noabi \
-I/usr/local/include/bsoncxx/v_noabi \
-L/usr/local/lib -lmongocxx -lbsoncxx
*/