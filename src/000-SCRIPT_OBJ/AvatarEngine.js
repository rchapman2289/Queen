// NOTES:
// This is the first hack at integrating the dynamic avatar engine with our little game.
// Pros: Was fast to do. Cons: Alot of customization ahead + lots of overhead now on adding clothing.
// TODO:
// - Cleanup code (ongoing)
// - Fork a proper branch of the source someplace for our custom parts.
// - Add some custom hair styles (looks painful).
// - Add clothing to the renderer.
// - Map all clothes to some models.
// - Make any parts that are missing.
App.Entity.AvatarEngine = class Avatar {

    constructor() {

        this.SettingHandler = function() {
            var container = $('#avatarContainer');
            if( App.EventHandlers.HasPlayerState() == true && container && settings.displayAvatar == true) {
                container.css("display", "block");
                App.Avatar._DrawPortrait();
            } else if( App.EventHandlers.HasPlayerState() == true && container && settings.displayAvatar == false) {
                container.css("display", "none");
            }
            // We might be in a mirror dialogue. We could put tags on the passages, but instead let's
            // just check for an element we know will always exist.
            if ($('#mirrorContainer').length) {
                state.display(state.active.title, null, "back"); //Tell engine to reload current passage
            }
        };

        this.Loaded = false;
        console.log("Loading DA system...");
        var t0 = performance.now();
        console.log("Creating patterns");
            
        //Loading patterns. Embedded patterns are in the story passage named the same as the
        //file name. Get the text attribute for the encoded string.
        da.addPattern("white hearts", Story.passages["txt_heart_1"].text);
        da.addPattern("pink checks", Story.passages["txt_pink_checks"].text);
        da.addPattern("pink tartan", Story.passages["txt_pink_tartan"].text)
        da.addPattern("pink gingham", Story.passages["txt_pink_gingham"].text);
        da.addPattern("red tartan", Story.passages["txt_red_tartan"].text);
        da.addPattern("black lace", Story.passages["txt_black_lace"].text);
        da.addPattern("black purple stripe", Story.passages["txt_black_purple_stripe"].text);
        da.addPattern("red plastic", Story.passages["txt_red_plastic"].text);
        da.addPattern("cow print", Story.passages["txt_cow_print"].text);
        da.addPattern("black fur", Story.passages["txt_black_fur"].text);
        da.addPattern("jolly roger big", Story.passages["txt_jolly_roger_big"].text);
        da.addPattern("black sequins", Story.passages["txt_black_sequin"].text);
        da.addPattern("horizontal pink stripe", Story.passages["txt_horizontal_pink_white_stripe"].text);
        da.addPattern("pink polka dot", Story.passages["txt_pink_polka_dot"].text);
        da.addPattern("vertical pink stripe", Story.passages["txt_vertical_pink_white_stripe"].text);
        da.addPattern("pink chevron", Story.passages["txt_pink_chevron"].text);
        da.addPattern("pink flowers", Story.passages["txt_pink_flowers"].text);

        //Gradients loaded as textures.
        da.addPattern("pink athletic socks", this._pinkAthleticSocks);

        da.load().then(function() {
            // Functions needed here to overwrite some default behavior of
            // the DA library.
            da.extendDimensionCalc("human.penisSize", function (base) {
                return this.getDim('penisSize');
            });

            da.extendDimensionCalc("human.testicleSize", function (base) {
                return this.getDim('testicleSize');
            });

            da.extendDimensionCalc('human.waistWidth', function(base) {
                return this.getDim('waistWidth')
            });

            da.extendDimensionCalc('human.breastSize', function(base) {
                return this.getDim('breastSize')
            });

            var t2 = performance.now();
            console.log("Loaded DA in "+(t2-t0)+"ms.");

            //Loop until all the patterns resolve.
            // var patternInterval = setInterval(function() {
            //     for(var i = 0; i < App.Data.AvatarPatterns.length; i++) {
            //         if (da.listAvailablePatterns().includes(App.Data.AvatarPatterns[i] == false)) return;
            //     }
            //     console.log("All DA Patterns Loaded");
            //     App.Avatar.Loaded = true;
            //     clearInterval(patternInterval);
            // }, 20);
 
        });

 
        this._PCData = {
            // provide specific values here to override the default ones set
            age : 26,
            fem : 11,
            sub : 2,
            // base physical dimensions
            basedim        : {
                //areolaSize    : 14.923766816143496,
                armThickness  : 58,
                armLength     : 45,
                //breastSize    : 9.974887892376682,
                //buttFullness  : 13.019992984917572,
                chinWidth     : 75,
                //eyelashLength : 3.0305156085584004,
                eyeSize       : 13,
                //faceFem       : 40,
                faceLength    : 235,
                faceWidth     : 85,
                //hairLength    : 37.03963521571379,
                //hairStyle     : 4,
                //hairHue       : 0,
                //hairSaturation: 19.081024202034374,
                //hairLightness : 11.224131883549632,
                handSize      : 120,
                //height        : 163.65022421524662,
                //hipWidth      : 110.85584005612066,
                //legFem        : 39.95790950543669,
                legFullness   : 4,
                legLength     : 97,
                //lipSize       : 19,
                //lowerMuscle   : 22.448263767099263,
                neckLength    : 80,
                neckWidth     :  35,
                //penisSize     : 50,
                //shoulderWidth : 64.28699551569507,
                skin          : 3,
                //testicleSize  : 60,
                //upperMuscle   : 0,
                //vaginaSize    : 40,
                //waistWidth    : 102.32549982462294,
            },
            Mods : {
                breastPerkiness: 4,
                lipBias: 30,
                lipCupidsBow: 1,
                lipCurl: -4.4,
                lipHeight: 1,
                lipTopCurve: 1

            },
            decorativeParts: [
                //da.Part.create(da.BeautyMark, {side: null}),
            ],
            // overriding clothing (default to simple red underwear)
            clothes: [
                //da.Clothes.create(da.Bra, da.sheerFabric),
               // da.Clothes.create(da.Panties, da.sheerFabric)
            ],
        };

    }

    DrawCanvas(element, height, width) {
        this._element = element;
        $(document).one(":passageend", this._DrawCanvas.bind(this));
    }

    _DrawCanvas() {
        var canvasGroup;
        if (typeof canvasGroup === 'undefined' || canvasGroup == null) {
            canvasGroup = da.getCanvasGroup(this._element, 
                {
                    border: "1px solid black",
                   // width: 480,
                   // height: 960
                   width: 360,
                   height: 800,
                });
        } 

        var PC = new da.Player( this.GetPCData() );
        PC = this._AttachParts(PC);
        da.draw(canvasGroup, PC, { 
                printHeight: false, 
                printAdditionalInfo: false, 
                renderShoeSideView: false,
                offsetX: 10,
                offsetY: 0
            });

        console.log(PC);
        //this._DrawPortrait();
    }

    DrawPortrait()
    {
        if( settings.displayAvatar == true)
        $(document).one(":passageend", this._DrawPortrait.bind(this));
    }

    _DrawPortrait()
    {
        if( settings.displayAvatar == false) return;

        var canvasGroup = da.getCanvasGroup("hiddenCanvas", {
               border: "none",
               width: 1000,
               height: 3000
            });

        var PC = new da.Player( this.GetPCData() );
        PC = this._AttachParts(PC);

        da.draw(canvasGroup, PC, { 
            printHeight: false, printAdditionalInfo: false, renderShoeSideView: false
            }).then(function (exports) {
            // draw just the head in a separate canvas
            // first retrieve/create the canvas if it's the first time we're getting it
            var portraitCanvas = da.getCanvas("portrait",
                {

                    width : 180,
                    height: 240,
                    // can add any CSS style here like border
                    border: "solid 2px goldenrod",
                    // you can also position it absolutely
                    // position: "absolute",
                    // top     : "10px",
                    // left    : "10px",
                    // or relative to a parent
                    position: "relative",
                    parent: document.getElementById("avatarFace"),
                });
        
            console.log(portraitCanvas);
            // you can call this multiple times to draw different parts (with different canvases)
            da.drawFocusedWindow(portraitCanvas,
                exports,
                {
                    center: exports[da.Part.RIGHT].neck.nape,
                    width: 55,
                    height: 70
                });
        });

        //da.hideCanvasGroup("hiddenCanvas");
    }

    GetPCData() {
        var Data = this._PCData;
        Data = this._MapHeight(Data);
        Data = this._MapHormones(Data);
        Data = this._MapFace(Data);
        Data = this._MapHair(Data);
        Data = this._MapGenitals(Data);
        Data = this._MapUpperBody(Data);
        Data = this._MapLowerBody(Data);
        return Data;
    }

    _AttachParts(PC) {
        var penis = da.Part.create(da.PenisHuman, { side: "right"});
        PC.attachPart(penis);
        var balls = da.Part.create(da.TesticlesHuman, { side: "right" });
        PC.attachPart(balls);
        var bust = da.Part.create(da.BimboChest, { side: null });
        PC.attachPart(bust);
        PC.removeSpecificPart(da.NipplesHuman);
        var nips = da.Part.create(da.BimboNipples, { side: null});
        PC.attachPart(nips);

        return this._ClothesHandler(PC);
    }

    
    _MapFace(Data) {
        var hormoneMod = (this._c('Hormones')/200);
        var lipMod = (setup.player.GetStat('BODY', 'Lips')/100);
        Data.basedim.eyelashLength = 0; // (10 * hormoneMod); --The color on this is broken.
        Data.basedim.faceFem = (20 * (setup.player.GetStat('BODY', 'Face')/100)) + (20 * hormoneMod);

        //Lips
        // -80 to 40
        Data.Mods.lipBotSize = -80 + (120 * lipMod);
        // 0 to 36
        Data.Mods.lipParting = (36 * lipMod);
        // -20 to 30
        Data.Mods.lipTopSize = -20 + (50 * lipMod);
        // -80 to -10 (reverse for wider, huh?)
        Data.Mods.lipWidth = -10 - (70 * lipMod);
        // 10 to 20
        Data.basedim.lipSize = 10 + (15 * lipMod);
        return Data;
    }

    _MapUpperBody(Data) {
        var hormoneMod = (this._c('Hormones')/200);
        var breast = setup.player.GetStat('BODY', 'Bust') == 0 ? 0 : (setup.player.GetStat('BODY', 'Bust')/2);
        var areola = (50 * hormoneMod);
        var upperMuscle = (40 * (this._c('Fitness')/100)) - (40 * hormoneMod);
        Data.basedim.breastSize = breast;
        Data.basedim.areolaSize = areola;
        Data.basedim.upperMuscle = upperMuscle;
        Data.basedim.shoulderWidth = 64;
        return Data;
    }

    _MapLowerBody(Data) {
        var hormoneMod = (this._c('Hormones')/200);
        var lowerMuscle = (40 * (this._c('Fitness')/100)) - (40 * hormoneMod);
        var ass = 5 + (35 * setup.player.GetStat('BODY', 'Ass') / 100);
        var hips = 90 + (70 * (setup.player.GetStat('BODY', 'Hips') / 100));
        var waist = 70 + (100 * (setup.player.GetStat('BODY', 'Waist')/100));
        Data.basedim.lowerMuscle = lowerMuscle;
        Data.basedim.buttFullness = ass;
        Data.basedim.hipWidth = hips;
        Data.basedim.waistWidth = waist;
        Data.basedim.legFem = (15 + (35 * hormoneMod));
        return Data;
    }
    _MapHeight(Data) { 
        Data.basedim.height = this._b('Height');
        return Data;
    }

    //TODO: Make new penis body part as the existing one doesn't scale large enough for the game.
    _MapGenitals(Data) {
        var penis = 80 * ( this._b('Penis') / 16);
        var balls = 40 * ( this._b('Balls')/ 9);
        Data.basedim.penisSize = penis;
        Data.basedim.testicleSize = balls;
        return Data;
    }

    _MapHormones(Data) {
        var hormoneMod = (this._c('Hormones')/200);
        Data.fem = 11 * hormoneMod;

        return Data;
    }

    /**
     * Map the players hair attributes
     * @param {*} Data 
     * @returns {*} 
     */
    _MapHair(Data) {

        var wig = setup.player.GetEquipmentInSlot("Wig");
        var length =  wig != null ? wig.HairLength() : this._b('Hair');
        var color = wig != null ? App.Data.Lists.HairColors[wig.HairColor()] : App.Data.Lists.HairColors[setup.player.HairColor];
        var style = wig != null ? wig.HairStyle() : setup.player.HairStyle;

        //TODO: We are missing some hair styles, so either we create them later or get creative.

        switch(style) {
            case 'a spunky boy cut"':
                //avatar: (min 30, max 110) game: (max 10)
                length = Math.min(110, ((80 * (length/20)) + 30));
                style = 7;
                break;
            case 'a loose and flippy style':
                //avatar: (min 45, max 60), game: (max 20)
                length = Math.min(60, ((15 * (length/20)) + 30));
                style = 2;
                break;
            case 'a short bob style':
            case 'a short bob':
                //avatar: (min 35, max 50)  game (max 30)
                length = Math.min(50, ((15 * (length/30)) + 35));
                style = 3;
                break;
            case 'a breezy style':
                //avatar (min 60, max 110) game (max 50)
                length = Math.min(110, ((50 * (length/50)) +60));
                style = 6;
                break;
            case 'a loose cut with flowing curls':
                style = 4;
                break;
            case 'cute pig tails':
                //avatar (min 90, max 110) game (50)
                length = Math.min(110, ((20 * (length/50)) + 90));
                style = 5;
                break;
            case 'a long pony tail':
                //avatar (min 90, max 110) game (100)
                length = Math.min(110, ((20 * (length/100)) + 90));
                style = 5;
                break;
            case 'a slick up-do style':
                //avatar (min 50, max 110) game (20)
                length = Math.min(110, ((60 * (length/20)) + 50));
                style = 1;
                break;
            case 'extravagantly long braids':
                style = 4;
                break;
            case 'extremely long twin tails':
                //avatar (min 90, max 110) game (80)
                length = Math.min(110, ((20 * (length/80)) + 90));
                style = 5;
                break;
            default:
                style = 2;
        }

        Data.basedim.hairLength = length;
        Data.basedim.hairStyle = style;
        Data.basedim.hairHue = color.h;
        Data.basedim.hairSaturation = color.s;
        Data.basedim.hairLightness = color.l;
        Data.browFill = 'black';
        Data.eyelashFill = 'black'

        return Data;
    }

    _ClothesHandler(PC) {

        for (var slot in setup.player.Equipment) {
            var o = setup.player.Equipment[slot];
            if (typeof o === 'undefined' || o == null || o.Slot == 'Wig') continue; //no op
            var id = App.Data.AvatarMaps.hasOwnProperty(o.Tag) ? o.Tag : o.Slot;
            if (App.Data.AvatarMaps.hasOwnProperty(id)) {
                var items = App.Data.AvatarMaps[id];
                for(var i = 0; i < items.length; i++) {
                    var str = "da.Clothes.create("+items[i].c+","+JSON.stringify(items[i].a)+")";
                    console.log(str);
                    // This nonsense here is just to be safe due to script 'compiling' order of Tweego.
                    if(items[i].a != null && items[i].a.hasOwnProperty('pattern') && typeof items[i].a.pattern === 'string') {
                        var patternOb = null;
                        try {
                            patternOb = eval(items[i].a.pattern);
                        } catch(err) {
                            console.log(err);
                        }
                        if (patternOb != null) items[i].a.fill = patternOb;
                    } 
                    var part = items[i].a == null ? da.Clothes.create(eval(items[i].c)) : da.Clothes.create(eval(items[i].c), items[i].a);
                    PC.wearClothing(part);
                }
            } else {
                console.log("Unable to map clothes to avatar: "+o.Tag);
                console.log(o);
            }
        }

        return PC;
    }

    _b(s) { return App.PR.StatToCM(setup.player, s); }

    _c(s) { return setup.player.GetStat('STAT', s); }

    // Gradients
    // I want to be able to dynamically scale these, waiting on a response from the DA developer about this.

    _pinkAthleticSocks(ctx, ex)
    {
        var grd = ctx.createLinearGradient(150.000, 0.000, 150.000, 180.000);
      
        // Add colors
        grd.addColorStop(0.000, 'lightpink');
        grd.addColorStop(0.514, 'lightpink');
        grd.addColorStop(0.521, 'white');
        grd.addColorStop(0.536, 'white');
        grd.addColorStop(0.541, 'lightpink');
        grd.addColorStop(0.551, 'lightpink');
        grd.addColorStop(0.560, 'white');
        grd.addColorStop(0.571, 'white');
        grd.addColorStop(0.580, 'lightpink');
        grd.addColorStop(1.000, 'lightpink');

        return grd;
    }

}