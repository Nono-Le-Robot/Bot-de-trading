// const { clear } = require('console');

//=============APPEL API BINANCE=============//
const chalk = require('chalk');
const Binance = require("node-binance-api");


// setTimeout(() => {
  // 	spinner.color = 'magenta';
  // 	spinner.text = 'Scan en cours..';
  // }, 1000);
  
  
  
  
  
  
  const binance = new Binance().options({
    
    APIKEY: "======================================API ICI===============================================",
    APISECRET: "======================================API PRIVEE ICI===============================================",
    useServerTime: true,
    useServerTime: true,
    recvWindow: 60000,
  });
  
  //=============VARIABLES=============//
  let candlesHighScan = [];
  let candlesLowScan = [];
  let BTCPrice = 0;
  let solde = 0; // récupérer le solde du compte
  let riskPourcentage = 0;
  let sizePosition = 0;
  let stopLoss = 0;
  let takeProfit = 0;
  let rlzLong618 = 0;
  let rlzLong886 = 0;
  let rlzShort = 0;
  let numbersizePosition = 0;
  let numberrlzLong = 0;
  let fixedrlzLong = 0;
  let fixedsizePosition = 0;
  let openorder = 0;
  let boucle = 1;
  
  let type = "STOP_LOSS";
  
  let price = 31000;
  let stopPrice = 31000;

 
  

  
  // sell: function ( symbol, quantity, price, flags = {},  ) {
    //   if ( !callback ) {
      //       return new Promise( ( resolve, reject ) => {
        //           callback = ( error, response ) => {
          //               if ( error ) {
            //                   reject( error );
            //               } else {
              //                   resolve( response );
              //               }
              //           }
              //           order( 'SELL', symbol, quantity, price, flags, callback );
              //       } )
              //   } else {
                //       order( 'SELL', symbol, quantity, price, flags, callback );
                //   }
                
                // },
                
                // binance.sell(symbol, quantity, price, {type: "LIMIT"}, (error, response) => {
                  //   if (!error) {
                    //       binance.buy(symbol, buyQuantity, buyPrice, {}, (error, response) => {
                      //           if (!error) {
                        //           }
                        //       });
                        //   }
                        // });
                        
                        
                        
                        
                        //=============FONCTIONS=============//
                        
                        function precise(x, y = 2) {
                          return Number.parseFloat(x).toFixed(y);
                        }
                        function preciseBTC(x, y = 3) {
                          return Number.parseFloat(x).toFixed(y);
                        }
                        
                        //=============FONCTION ASYNCHRONE BINANCE=============//   
                        (async function () {
                          
                          
                          let futuresAccount = await binance.futuresAccount();
                          let futuresBalance = await binance.futuresBalance();
                          let futuresPosition = await binance.futuresPositionRisk();
                          
                          
                          //=============ANALYSE DES CANDLES=============//   
                          //while(boucle == 1){
                            
                            //solde = precise(futuresBalance[1].balance, 2); // solde de l'API
                            solde=100
                            
                            
                            
                            let allpnl = futuresAccount.totalUnrealizedProfit;
                            let BTCUSDTPNL = futuresPosition[102].unRealizedProfit;
                            let BTCUSDTSizeOpen = futuresPosition[102].positionAmt
                            
                            await binance.candlesticks(
                              "BTCUSDT", 
                              "1h", // Intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
                              (error, ticks, symbol) => {
                                let i = 0;
                                for (let tick of ticks) {
                                  let [
                                    time,
                                    open,
                                    high,
                                    low,
                                    close,
                                    volume,
                                    closeTime,
                                    assetVolume,
                                    trades,
                                    buyBaseVolume,
                                    buyAssetVolume,
                                    ignored,
                                  ] = tick;
                                  let timestamp = new Date(time).toLocaleString();
                                  candlesHighScan.push(precise(high));
                                  candlesLowScan.push(precise(low));
                                }
                              },
                              { limit: 618 } // nombre de candles pris en compte dans l'analyse
                              );
                              await new Promise((r) => setTimeout(r, 2000));
                              await binance.prices("BTCUSDT", (error, ticker) => {
                                BTCPrice = ticker.BTCUSDT;
                                
                                //=============CALCULS=============//
                                riskPourcentage = precise((5 * solde) / 100);
                                higher = Math.max(...candlesHighScan);
                                lower = Math.min(...candlesLowScan);
                                rlzLong618 = higher - (higher - lower) * 0.618;
                                rlzLong886 = higher - (higher - lower) * 0.886;
                                rlzShort = lower + (higher - lower) * 0.618;
                                stopLoss = lower -6.18     // - (6.18 / 100) * 100;
                                sizePosition = riskPourcentage / (rlzLong618 - stopLoss);
                                fixedsizePosition = sizePosition.toFixed(3);
                                fixedrlzLong = rlzLong618.toFixed(2);
                                numbersizePosition = parseFloat(fixedsizePosition);
                                numberrlzLong = parseFloat(fixedrlzLong);
                                takeProfit = riskPourcentage * 3; // nombre = ratio
                                
                                
                                //=============CONSOLE.LOG=============//
                                
                                console.clear()
                                console.log(chalk.cyanBright("============Infos BTC==========="));
                                if(BTCPrice <= numberrlzLong){console.log(chalk.cyan("BTC PRICE : " + chalk.yellow(precise(BTCPrice) + " $")));}
                                else {console.log(chalk.cyan("BTC PRICE : " + precise(BTCPrice) + " $"));}
                                console.log(chalk.cyan("High : " + higher + " $"));
                                console.log(chalk.cyan("Low : " + lower + " $"));
                                if(BTCPrice <= numberrlzLong){console.log(chalk.cyan("61.8 (LONG) : ") +chalk.yellow( precise(rlzLong618) + " $"));}
                                else {console.log(chalk.cyan("61.8 (LONG) : " + precise(rlzLong618) + " $"));  } 
                                if(BTCPrice>rlzLong886 && BTCPrice<numberrlzLong){ console.log(chalk.cyan("88.6 (LONG) : " +chalk.yellow( precise(rlzLong886) + " $"))); }
                                else{ console.log(chalk.cyan("88.6 (LONG) : " + precise(rlzLong886) + " $")); }
                                console.log(chalk.cyan("SL : " + stopLoss + " $"));
                                console.log(chalk.cyan("5% du capital  : " + riskPourcentage + " $"));
                                console.log(chalk.cyan("Taille de position  : " + fixedsizePosition + " BTC"));
                                if(BTCUSDTSizeOpen != 0){console.log(chalk.cyanBright("========Trades en cours========="));
                                if (BTCUSDTSizeOpen > 0){ console.log(chalk.cyan("Side : ")  + '\x1b[32m%s\x1b[0m', "LONG") }
                                else if (BTCUSDTSizeOpen < 0) { console.log(chalk.cyan("Side : ")  + '\x1b[31m%s\x1b[0m', "SHORT"); }
                                console.log(chalk.cyan("Taille de position : ") + BTCUSDTSizeOpen);
                                if (BTCUSDTPNL>1){ console.log(chalk.cyan("PNL : ") +'\x1b[32m%s\x1b[0m', precise(BTCUSDTPNL));}
                                else if (BTCUSDTPNL<1){ console.log(chalk.cyan("PNL : ") +'\x1b[31m%s\x1b[0m', precise(BTCUSDTPNL));}
                                console.log(chalk.cyan("Si trade gagnant : ") +chalk.green( takeProfit.toFixed(2) + " $"));
                                console.log(chalk.cyan("Si trade perdant : ") + chalk.red(riskPourcentage + " $"));
                                
                                
                              }
                            });
                            
                            await new Promise((r) => setTimeout(r, 2000));
                            
                            //=============CONDITIONS DE TRADE=============//
                            
                            
                            //========AJUSTEMENT DU LEVIER=======
                            await binance.futuresLeverage( 'BTCUSDT', 50 );
                            
                            
                            if (BTCUSDTSizeOpen == 0.000 && BTCPrice <=  rlzLong618 && BTCPrice >= rlzLong886) {
                              //========OUVRIR LONG=======
                              await binance.futuresMarketBuy("BTCUSDT", numbersizePosition);
                              await new Promise((r) => setTimeout(r, 1000));
                              console.log("Setup LONG Trouvé = ordre ouvert au market !");
                              
                            }
                            //========SL=======
                            
                            
                            
                            if (BTCUSDTSizeOpen != 0.000 && BTCUSDTPNL <= -riskPourcentage) { 
                              await binance.futuresMarketSell("BTCUSDT", BTCUSDTSizeOpen);
                              await new Promise((r) => setTimeout(r, 1000));
                              console.log("Stop Loss touché !");
                            } 
                            
                            // ========TP=======
                            if(BTCUSDTSizeOpen != 0 && BTCUSDTPNL >= takeProfit){
                              await binance.futuresMarketSell("BTCUSDT", BTCUSDTSizeOpen);
                              await new Promise((r) => setTimeout(r, 1000));
                              console.log("Take Profit touché !");
                              
                            }
                            
                            
                            //}
                          })();
                          