
var adPublisherIds = 
{
  ios : 
  {
	interstitial : "ca-app-pub-8607059282540011/7800307352",
	rewarded : "ca-app-pub-8607059282540011/4316643323",
  },
  android : 
  {
	interstitial : "ca-app-pub-8607059282540011/2739552362",
	rewarded : "ca-app-pub-8607059282540011/1961942727",
  }
};


var objAdMobID = !blnApple ? adPublisherIds.android : adPublisherIds.ios;

function initAds()
{
	admob.rewardvideo.config(
	{
		id: objAdMobID.rewarded,
		isTesting: false,
		autoShow: false,
	})
	admob.rewardvideo.prepare();

	admob.interstitial.config(
	{
		id: objAdMobID.interstitial,
		isTesting: false,
		autoShow: false,
	})
	admob.interstitial.prepare();


  document.addEventListener('admob.rewardvideo.events.OPEN',
  function (event) 
	{
		removeLoading();
  });

  document.addEventListener('admob.rewardvideo.events.CLOSE',
  function (event) 
	{  
	  admob.rewardvideo.prepare();
  });

  document.addEventListener('admob.rewardvideo.events.EXIT_APP',
  function (event) 
  {
   // alert('events.EXIT_APP');
  });

  /* only works if admob detects that the user has finished watching the whole reward video else it will do nothing */
  document.addEventListener('admob.rewardvideo.events.REWARD',
  function (event) 
	{
			//objMain.watchedVideo();
			admob.rewardvideo.prepare();
  });


	document.addEventListener('admob.interstitial.events.OPEN', function()
  {
		removeLoading();
   // admob.interstitial.prepare();
  });

  document.addEventListener('admob.interstitial.events.CLOSE', function()
  {
  	removeLoading();
    admob.interstitial.prepare();
    objMain.showThumbsUp();
  });
      

}

function showInterstitial()
{
	showWaiting();
	admob.interstitial.show();
}

function showRewardAd()
{
	showWaiting();
	admob.rewardvideo.show();
}