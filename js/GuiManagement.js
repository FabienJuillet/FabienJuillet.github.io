function setupGui(){
	
	effectController = {

		NewAngleHor: 10,
		NewAngleVer: 20,
		NewVelocity: 20,
		NewRotationSpeed: 10,
		NewSimulationTimeRatio: 1./SimulationTimeRatio*100,
		NewArrowVisible: false,   // Valeur intiale
		NewGrass: false,
		NewBoomerangName: "Challenger",
		NewCameraView: "Vue suivie de trajectoire",
		NewInitialConditionArrows: false,
		StartStop: function() { //gui.__controllers[0].updateDisplay();
								//gui.__controllers[0].remove();
								running = !running;
								InitialState=false;
								RefreshGui();
								SetArrowsVisible((effectController !== undefined)? effectController.NewArrowVisible&&(!InitialState) : false)
								
								var boomerang = scene.getObjectByName("boomerang")
								if (boomerang!=undefined) {
									SetArrowVisible(boomerang.VelocityArrow,false);
									SetArrowVisible(boomerang.RotationSpeedArrow,false);									
								}
								//setDisabledFolderGUI("Conditions Initiales", !InitialState);
								//gui.__folders["Conditions Initiales"].closed=!InitialState;
		},
								
		reStart: function() { 
							running = false;
							InitialState=true;
							RefreshGui();
							
							//setDisabledFolderGUI("Conditions Initiales", !InitialState);	
							//gui.__folders["Conditions Initiales"].closed=!InitialState;
							
							UpdateBoomerangInitialConditions();
							physicalTime=0;
							InitializeT0=true;
							
							// Tire une couleur aleatoire (la valeur 30 assure une  couleur pas trop sombre)
							var RandomColor= getRandomIntInclusive(30, 255)*256*256 +getRandomIntInclusive(30, 255)*256+ getRandomIntInclusive(30, 255)
							CreateNewTrajectories(RandomColor);							
							UpdateCurrentTrajectories();
							
							distCameraBoomerang=distInitialeCameraBoomerang;
							camera.position.addVectors(positionInitialeBoomerang,distCameraBoomerang);
							cameraControls.target.copy(positionInitialeBoomerang);						
		}
	};

	gui = new dat.GUI();
	gui.width=420;
	gui.add( effectController, "StartStop")
	//.name(running?"<LEFT><font size=4 color=red>STOP</font></LEFT>":"<LEFT><font size=4 color=white>START</font></LEFT>");
	
	var CI = gui.addFolder("Conditions Initiales");
	//	CI.__ul.onclick=function(){
	//	if (!InitialState) {gui.__folders["Conditions Initiales"].closed=true};
	//};
	
	var BoomerangNameController = CI.add( effectController, "NewBoomerangName",['Equerre','Challenger','MTA']).name("Sélection du boomerang");
	BoomerangNameController.onChange(function(){if (InitialState) UpdateBoomerangInitialConditions();});
	
	var Velocity = CI.add( effectController, "NewVelocity",0.0 ,70.0 ).name("Vitesse du lancé (m/s)");
	Velocity.onChange(function(){if (InitialState) UpdateBoomerangInitialConditions();});

	var RotationSpeed = CI.add( effectController, "NewRotationSpeed",0.0 ,30.0 ).name("Vitesse de rotation (tr/s)");
	RotationSpeed.onChange(function(){if (InitialState) UpdateBoomerangInitialConditions();});

	var AngleVerController = CI.add( effectController, "NewAngleVer",-90 ,90.0).name("Inclinaison (deg)");
	AngleVerController.onChange( function(){if (InitialState==true) UpdateBoomerangInitialConditions();});
	
	var AngleHorController = CI.add( effectController, "NewAngleHor",-10.0 ,90.0 ).name("Hauteur du lancé (deg)");
	AngleHorController.onChange(function(){if (InitialState) UpdateBoomerangInitialConditions();});
	
	//setDisabledFolderGUI("Conditions Initiales", false);
	
	var OptionGraph = gui.addFolder("Options Graphiques");
	
	var SimulationTimeRatioController = OptionGraph.add( effectController, "NewSimulationTimeRatio",0.1,25 ).name("Rapidité de la simulation (%)");
		SimulationTimeRatioController.onChange(function(){
		InitializeT0=true;
		SimulationTimeRatio=1./effectController.NewSimulationTimeRatio*100.;
	});
	
	var CameraViewController = OptionGraph.add( effectController, "NewCameraView",['Suivie de trajectoire','Depuis lanceur','Depuis le dessus','Depuis le côté']).name("Gestion du mode vue");
	CameraViewController.onChange(function(){});

	var ArrowController= OptionGraph.add( effectController, "NewArrowVisible").name("Forces aérodynamiques");
		ArrowController.onChange(function(){
		SetArrowsVisible((effectController !== undefined)? effectController.NewArrowVisible&&(!InitialState) : false);
	});
	
	var InitialConditionArrows= OptionGraph.add( effectController, "NewInitialConditionArrows").name("Vecteurs conditions initiales");
	InitialConditionArrows.onChange(function(){if (InitialState) UpdateBoomerangInitialConditions();});
	
	var GrassController= OptionGraph.add( effectController, "NewGrass").name("Pelouse");
		GrassController.onChange(function(){
		scene.remove(scene.getObjectByName("ground"));
		drawGround(effectController.NewGrass);
	});
	
	gui.add( effectController, "reStart").name("<LEFT><font size=4 color=white>NOUVEAU LANCE</font></LEFT>");

	RefreshGui();
	
	
}

function setDisabledFolderGUI(name, disabled){
	for (var i in gui.__folders[name].__controllers){
		var c = gui.__folders[name].__controllers[i];
		c.disabled=disabled;
		console.log("setDisablesFolder");
		
	}
}

function RefreshGui(){
gui.__controllers[0].name(running?"<LEFT><font size=4 color=red>STOP</font></LEFT>":"<LEFT><font size=4 color=white>START</font></LEFT>");
gui.__folders["Conditions Initiales"].name=InitialState?"<font color=white>Conditions InitialeSSs</font>":"<font color=grey>Conditions InitialeRRs</font>";
}

