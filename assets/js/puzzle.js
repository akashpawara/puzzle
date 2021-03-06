var board,
  wordArr,
  wordBank,
  wordsActive,
  boardMap,
  focusChar,
  focusIndex = null,
  mode,
  wordElementsAcross,
  wordElementsDown;

var answers = [];

var Bounds = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  Update: function (x, y) {
    this.top = Math.min(y, this.top);
    this.right = Math.max(x, this.right);
    this.bottom = Math.max(y, this.bottom);
    this.left = Math.min(x, this.left);
  },

  Clean: function () {
    this.top = 999;
    this.right = 0;
    this.bottom = 0;
    this.left = 999;
  }
};

$(document).ready(function(){
    $("#intro-1").typewrite({
        actions: [
            {type: 'Hello Fellow Muggles'},
            {delay: 2000},
            {type: ' Blimey!!'},
            {delay: 1000},
            {remove: {num: 1, type: 'stepped'}},
            {select: {from: 13, to: 28}},
            {delay: 1000},
            {remove: {num: 15, type: 'whole'}},
            {delay: 300},
            {type: 'Wizards !! &#128516; '},
            {type: '<br>'},
            {delay: 1000},
            {type: '<br>'},
            {type: `Before we continue with our game, let's take some notes`},
            {delay: 1000},
            {type: '<br>'},
            {type: 'Scroll down to see the clues for the puzzle'},
            {delay: 1000},
            {type: '<br>'},
            {type: 'Move your mouse over clues to get some more hints'},
            {delay: 1000},
            {type: '<br>'},
            {type: '<br>'},
            {type: 'Keep track of higlighted letters, as they are the clues for your next puzzle'},
            {delay: 2000},
            {type: '<br>'},
            {type: '<br>'},
            {type: `So, Let's Begin...... `},
          ]
        });
    setTimeout(()=>{ $("#intro-1").fadeOut(2000);},37500)
    setTimeout(()=>{ 
        $("#intro-1").css('display','none'); 
        $(".container").fadeIn(2000); 
        $(".container").css('display','block'); 
    },39500)
});

function Play() {
  var charEleArr = document.getElementsByClassName("char");
  mode = 0;

  for (var i = 0; i < charEleArr.length; i++) {
    RegisterChar(charEleArr[i], boardMap[i]);
    charEleArr[i].placeholder = "";
  }

  ToggleInputBoxes(false);

  FormatClues();
}

function FormatClues() {
  var cluesAcross = document.getElementById("cluesAcross"),
    cluesDown = document.getElementById("cluesDown"),
    directionAcross = document.getElementById("directionAcross"),
    directionDown = document.getElementById("directionDown");

  cluesAcross.innerHTML = "";
  cluesDown.innerHTML = "";

  cluesAcross.appendChild(directionAcross);
  cluesDown.appendChild(directionDown);

  for (i = 0; i < wordElementsAcross.length; i++) {
    var lineEle = cluesAcross.appendChild(wordElementsAcross[i].ele),
      numEle = lineEle.getElementsByClassName("lineNum")[0];
    // console.log(numEle);
    numEle.innerHTML = wordElementsAcross[i].num;
    RemoveClass(numEle, "disabled");
  }

  for (i = 0; i < wordElementsDown.length; i++) {
    var lineEle = cluesDown.appendChild(wordElementsDown[i].ele),
      numEle = lineEle.getElementsByClassName("lineNum")[0];
    numEle.innerHTML = wordElementsDown[i].num;
    RemoveClass(numEle, "disabled");
  }
}

function Create() {
  wordElementsAcross = [];
  wordElementsDown = [];

  console.log();

  if (mode === 0) {
    mode = 1;
    document.getElementById("crossword").innerHTML = BoardToHtml(" ");
    ToggleInputBoxes(true);
  }
}

function Generate() {
  wordElementsAcross = [];
  wordElementsDown = [];

  mode = 1;
  GetWordsFromInput();

  for (var i = 0, isSuccess = false; i < 19 && !isSuccess; i++) {
    CleanVars();
    isSuccess = PopulateBoard();
  }

  document.getElementById("crossword").innerHTML = isSuccess
    ? BoardToHtml(" ")
    : "Failed to find crossword.";

  FormatClues();
  ToggleInputBoxes(true);
}

function ToggleInputBoxes(active) {
  var w = document.getElementsByClassName("word"),
    d = document.getElementsByClassName("clue"),
    b = document.getElementById("btnGen"),
    dir = document.getElementsByClassName("clueDirection"),
    char = document.getElementsByClassName("char");

  if (active) {
    RemoveClass(b, "disabled");

    for (var i = 0; i < w.length; i++) {
      RemoveClass(w[i], "hide");
      RemoveClass(d[i], "clueReadOnly");
      d[i].disabled = "";
    }

    for (i = 0; i < dir.length; i++) {
      AddClass(dir[i], "disabled");
    }

    for (i = 0; i < char.length; i++) {
      AddClass(char[i], "charReadOnly");
      char[i].disabled = "readonly";
    }
  } else {
    AddClass(b, "disabled");

    for (var i = 0; i < w.length; i++) {
      AddClass(w[i], "hide");
      AddClass(d[i], "clueReadOnly");
      d[i].disabled = "readonly";
    }

    for (i = 0; i < dir.length; i++) {
      RemoveClass(dir[i], "disabled");
    }

    for (i = 0; i < char.length; i++) {
      RemoveClass(char[i], "charReadOnly");
      char[i].disabled = "";
    }
  }
}

function GetWordsFromInput() {
  wordArr = [];
  for (
    var i = 0, val, w = document.getElementsByClassName("line");
    i < w.length;
    i++
  ) {
    val = w[i].getElementsByClassName("word")[0].value.toUpperCase();
    if (val !== null && val.length > 1) {
      wordArr.push({ ele: w[i], value: val });
    }
  }
}

function CleanVars() {
  Bounds.Clean();
  wordBank = [];
  wordsActive = [];
  board = [];

  for (var i = 0; i < 50; i++) {
    board.push([]);
    for (var j = 0; j < 50; j++) {
      board[i].push({ value: null, char: [] });
    }
  }
}

function PopulateBoard() {
  PrepareBoard();
  //console.log("board: "+ board.length);
  for (var i = 0, isOk = true, len = wordBank.length; i < len && isOk; i++) {
    isOk = AddWordToBoard();
  }
  return isOk;
}

function PrepareBoard() {
  wordBank = [];

  for (var i = 0, len = wordArr.length; i < len; i++) {
    wordBank.push(new WordObj(wordArr[i]));
  }
  //console.log(wordBank);

  for (i = 0; i < wordBank.length; i++) {
    for (var j = 0, wA = wordBank[i]; j < wA.char.length; j++) {
      for (var k = 0, cA = wA.char[j]; k < wordBank.length; k++) {
        for (var l = 0, wB = wordBank[k]; k !== i && l < wB.char.length; l++) {
          wA.totalMatches += cA === wB.char[l] ? 1 : 0;
        }
      }
    }
  }
}

// TODO: Clean this guy up
function AddWordToBoard() {
  var i,
    len,
    curIndex,
    curWord,
    curChar,
    curMatch,
    testWord,
    testChar,
    minMatchDiff = 9999,
    curMatchDiff;

  if (wordsActive.length < 1) {
    curIndex = 0;
    for (i = 0, len = wordBank.length; i < len; i++) {
      if (wordBank[i].totalMatches < wordBank[curIndex].totalMatches) {
        curIndex = i;
      }
    }
    wordBank[curIndex].successfulMatches = [{ x: 12, y: 12, dir: 0 }];
  } else {
    curIndex = -1;

    for (i = 0, len = wordBank.length; i < len; i++) {
      curWord = wordBank[i];
      //console.log(curWord);
      curWord.effectiveMatches = 0;
      curWord.successfulMatches = [];
      for (var j = 0, lenJ = curWord.char.length; j < lenJ; j++) {
        curChar = curWord.char[j];
        for (var k = 0, lenK = wordsActive.length; k < lenK; k++) {
          testWord = wordsActive[k];
          for (var l = 0, lenL = testWord.char.length; l < lenL; l++) {
            testChar = testWord.char[l];
            if (curChar === testChar) {
              curWord.effectiveMatches++;
              var curCross = { x: testWord.x, y: testWord.y, dir: 0 };
              if (testWord.dir === 0) {
                curCross.dir = 1;
                curCross.x += l;
                curCross.y -= j;
              } else {
                curCross.dir = 0;
                curCross.y += l;
                curCross.x -= j;
              }

              var isMatch = true;

              for (var m = -1, lenM = curWord.char.length + 1; m < lenM; m++) {
                var crossVal = [];
                if (m !== j) {
                  if (curCross.dir === 0) {
                    var xIndex = curCross.x + m;

                    if (xIndex < 0 || xIndex > board.length) {
                      isMatch = false;
                      break;
                    }

                    crossVal.push(board[xIndex][curCross.y].value);
                    crossVal.push(board[xIndex][curCross.y + 1].value);
                    crossVal.push(board[xIndex][curCross.y - 1].value);
                  } else {
                    var yIndex = curCross.y + m;

                    if (yIndex < 0 || yIndex > board[curCross.x].length) {
                      isMatch = false;
                      break;
                    }

                    crossVal.push(board[curCross.x][yIndex].value);
                    crossVal.push(board[curCross.x + 1][yIndex].value);
                    crossVal.push(board[curCross.x - 1][yIndex].value);
                  }

                  if (m > -1 && m < lenM - 1) {
                    if (crossVal[0] !== curWord.char[m]) {
                      if (crossVal[0] !== null) {
                        isMatch = false;
                        break;
                      } else if (crossVal[1] !== null) {
                        isMatch = false;
                        break;
                      } else if (crossVal[2] !== null) {
                        isMatch = false;
                        break;
                      }
                    }
                  } else if (crossVal[0] !== null) {
                    isMatch = false;
                    break;
                  }
                }
              }

              if (isMatch === true) {
                curWord.successfulMatches.push(curCross);
              }
            }
          }
        }
      }

      curMatchDiff = curWord.totalMatches - curWord.effectiveMatches;

      if (curMatchDiff < minMatchDiff && curWord.successfulMatches.length > 0) {
        curMatchDiff = minMatchDiff;
        curIndex = i;
      } else if (curMatchDiff <= 0) {
        return false;
      }
    }
  }

  if (curIndex === -1) {
    return false;
  }

  var spliced = wordBank.splice(curIndex, 1);
  wordsActive.push(spliced[0]);

  var pushIndex = wordsActive.length - 1,
    rand = Math.random(),
    matchArr = wordsActive[pushIndex].successfulMatches,
    matchIndex = Math.floor(rand * matchArr.length),
    matchData = matchArr[matchIndex];

  wordsActive[pushIndex].x = matchData.x;
  wordsActive[pushIndex].y = matchData.y;
  wordsActive[pushIndex].dir = matchData.dir;

  var prevObj = null;

  for (i = 0, len = wordsActive[pushIndex].char.length; i < len; i++) {
    var cObj,
      cIndex,
      xInd = matchData.x,
      yInd = matchData.y;

    if (matchData.dir === 0) {
      xInd = matchData.x + i;
    } else {
      yInd = matchData.y + i;
    }

    cObj = {
      wordIndex: pushIndex,
      prev: prevObj,
      value: wordsActive[pushIndex].char[i],
      next: null
    };

    cIndex = board[xInd][yInd].char.length;

    board[xInd][yInd].char.push(cObj);
    board[xInd][yInd].value = wordsActive[pushIndex].char[i];

    Bounds.Update(xInd, yInd);

    if (prevObj !== null) {
      prevObj.next = board[xInd][yInd].char[cIndex];
    }

    prevObj = board[xInd][yInd].char[cIndex];
  }

  prevObj = null;
  return true;
}

function BoardToHtml(blank) {
  boardMap = [];

  for (var i = Bounds.top - 1, str = ""; i < Bounds.bottom + 2; i++) {
    str += "<div class='row'>";
    for (var j = Bounds.left - 1; j < Bounds.right + 2; j++) {
      str += BoardCharToElement(board[j][i]);
    }
    str += "</div>";
  }
  return str;
}

function BoardCharToElement(c) {
  var inner = "";
  //console.log(inner);

  if (c.value !== null) {
    var num = "";

    for (var i = 0; i < c.char.length; i++) {
      c.char[i].index = boardMap.length;
      if (c.char[i].prev === null) {
        var matchingObj = wordsActive[c.char[i].wordIndex];

        if (num === "") {
          num = wordElementsDown.length + wordElementsAcross.length + 1;
        }
        if (matchingObj.dir === 0) {
          wordElementsAcross.push({ num: num, ele: matchingObj.element });
        } else {
          wordElementsDown.push({ num: num, ele: matchingObj.element });
        }
      }
    }
    boardMap.push(c);

    inner = EleStr(
      "input",
      [
        { a: "type", v: ["text"] },
        { a: "class", v: ["char"] },
        { a: "maxlength", v: ["1"] },
        { a: "data-letter", v: [c.value] },
        { a: "placeholder", v: [c.value] }
      ],
      EleStr("span", [{ a: "class", v: ["num"] }], num)
    );
  }
  return EleStr("div", [{ a: "class", v: ["square"] }], inner);
}

function BoardCharClick(boardChar) {
  if (mode === 1) {
    return;
  }

  if (boardChar.char.length > 1) {
    if (focusIndex >= boardChar.char.length - 1) {
      focusIndex = 0;
    } else {
      focusIndex++;
    }
  }
}

function BoardCharFocus(boardChar) {
  if (mode === 1) {
    return;
  }

  if (
    !(
      boardChar.char[focusIndex] &&
      boardChar.char[focusIndex].prev === focusChar
    )
  ) {
    focusIndex = Math.max(0, boardChar.char.indexOf(focusChar));
  }

  this.onkeydown = function (e) {
    if (mode === 1) {
      return;
    }
    var key = e.keyCode || e.which;

    if (key === 8) {
      if (boardChar.char[focusIndex].prev != null) {
        focusChar = boardChar.char[focusIndex].prev;

        var isEnd = boardChar.char[focusIndex].next === null ? true : false;

        document
          .getElementsByClassName("char")
          [boardChar.char[focusIndex].prev.index].focus();

        if (isEnd) {
          document.getElementsByClassName("char")[
            boardChar.char[focusIndex].index
          ].value = "";
          document.getElementsByClassName("char")[
            boardChar.char[focusIndex].next.index
          ].value = "";
        }
      }
    }
  };

  this.onkeypress = function () {
    if (mode === 1) {
      return;
    }
    if (boardChar.char[focusIndex].next !== null) {
      focusChar = boardChar.char[focusIndex].next;
      document
        .getElementsByClassName("char")
        [boardChar.char[focusIndex].next.index].focus();
    }
  };
}

function WordObj(wordData) {
  this.element = wordData.ele;
  this.string = wordData.value;
  this.char = wordData.value.split("");
  this.totalMatches = 0;
  this.effectiveMatches = 0;
  this.successfulMatches = [];
}

function RegisterEvents() {
  document.getElementById("btnPlay").addEventListener("click", Play, false);

  document.getElementById("btnCreate").addEventListener("click", Create, false);

  document.getElementById("btnGen").addEventListener("click", Generate, false);
}
RegisterEvents();

function RegisterChar(ele, boardChar) {
  ele.onclick = CreateCallback("click", boardChar);
  ele.onfocus = CreateCallback("focus", boardChar);
}

function CreateCallback(type, boardChar) {
  switch (type) {
    case "click":
      return function () {
        BoardCharClick(boardChar);
      };
    case "focus":
      return function () {
        BoardCharFocus(boardChar);
      };
  }
}

function EleStr(e, c, h) {
  h = h ? h : "";
  for (var i = 0, s = "<" + e + " "; i < c.length; i++) {
    s += c[i].a + "='" + ArrayToString(c[i].v, " ") + "' ";
  }
  return s + ">" + h + "</" + e + ">";
}

function ArrayToString(a, s) {
  if (a === null || a.length < 1) return "";
  if (s === null) s = ",";
  for (var r = a[0], i = 1; i < a.length; i++) {
    r += s + a[i];
  }
  return r;
}

function AddClass(ele, classStr) {
  ele.className = ele.className.replaceAll(" " + classStr, "") + " " + classStr;
}

function RemoveClass(ele, classStr) {
  ele.className = ele.className.replaceAll(" " + classStr, "");
}

function ToggleClass(ele, classStr) {
  var str = ele.className.replaceAll(" " + classStr, "");
  ele.className =
    str.length === ele.className.length ? str + " " + classStr : str;
}

String.prototype.replaceAll = function (replaceThis, withThis) {
  var re = new RegExp(replaceThis, "g");
  return this.replace(re, withThis);
};

Create();
Generate();
Play();

let T = false;
let H = false;
let E = false;
let L = false;
let A = false;
let K = false;
let Y = false;
let C = false;
let U = false;
let D = false;
let R = false;
let O = false;
let N = false;
let stat;
$("#btnCheck").click(function () {
    stat=0;
  $(".square input").each(function () {
    if (!($(this).attr("data-letter") === $(this).val().toUpperCase())) {
      console.log("incorrect");
      stat++;
    //   console.log(stat);
      $(this).val("");
    }
    switch($(this).val().toUpperCase()){
        case 'T':
            if(!T){
                let test = document.querySelector('[data-letter="T"]');
                test.classList.add("test");
                T = true;
            }
            break;
        case 'H':
            if(!H){
                let test = document.querySelector('[data-letter="H"]');
                test.classList.add("test");
                H = true;
            }
            break;
        case 'E':
            if(!E){
                let test = document.querySelector('[data-letter="E"]');
                test.classList.add("test");
                E = true;
            }
            break;
        case 'L':
            if(!L){
                let test = document.querySelector('[data-letter="L"]');
                test.classList.add("test");
                L = true;
            }
            break;
        case 'A':
            if(!A){
                let test = document.querySelector('[data-letter="A"]');
                test.classList.add("test");
                A = true;
            }
            break;
        case 'K':
            if(!K){
                let test = document.querySelector('[data-letter="K"]');
                test.classList.add("test");
                K = true;
            }
            break;
        case 'Y':
            if(!Y){
                let test = document.querySelector('[data-letter="Y"]');
                test.classList.add("test");
                Y = true;
            }
            break;
        case 'C':
            if(!C){
                let test = document.querySelector('[data-letter="C"]');
                test.classList.add("test");
                C = true;
            }
            break;
        case 'U':
            if(!U){
                let test = document.querySelector('[data-letter="U"]');
                test.classList.add("test");
                U = true;
            }
            break;
        case 'D':
            if(!D){
                let test = document.querySelector('[data-letter="D"]');
                test.classList.add("test");
                D = true;
            }
            break;
        case 'R':
            if(!R){
                let test = document.querySelector('[data-letter="R"]');
                test.classList.add("test");
                R = true;
            }
            break;
        case 'O':
            if(!O){
                let test = document.querySelector('[data-letter="O"]');
                test.classList.add("test");
                O = true;
            }
            break;
        case 'N':
            if(!N){
                let test = document.querySelector('[data-letter="N"]');
                test.classList.add("test");
                N = true;
            }
            break;
        default:
            break;
    }
  });
  console.log(stat);
  if(stat===0){
    $('.container').fadeOut(3000);
    setTimeout(()=>{ 
        $('.container').css('display','none');
        $('#intro-2').fadeIn(3000);
    },3000);
    setTimeout(()=>{
        $('#intro-2').css('display','block');
        $("#intro-2").typewrite({
            actions: [
                {delay: 2000},
                {type: 'So did you lookout for those Highlighted letters?'},
                {delay: 4000},
                {type: '<br>'},
                {type: '<br>'},
                {type: `{T, H, E, L, A, K, Y, C, U, V, D, R, O, N} These were the letters right?`},
                {delay: 3000},
                {type: '<br>'},
                {type: '<br>'},
                {type: 'So in the next Puzzle, these letters will be jumbled up'},
                {delay: 1000},
                {type: '<br>'},
                {type: 'You need to drag those letters to thier respective place to make a meaningful reference'},
                {delay: 1000},
                {type: '<br>'},
                {type: '<br>'},
                {type: `So, Let's Begin...... `},
              ]
            });
    },3500)
    setTimeout(()=>{ 
        $('#intro-2').fadeOut(3000);
    },39000);
    setTimeout(()=>{ 
        $('#intro-2').css('display','none');
        $('#wrapper').fadeIn(3000);
        $('#wrapper').css('display','block');
    },42000);
  }
});

$(function () {
    var word = "THELEAKYCAULDRON",
      rand = [],
      puzzle = $("#puzzle").hide();
  
    var letters = word.split("");
    var jumble = letters.slice().sort(function () {
      return 0.5 - Math.random();
    });
  
    $.each(jumble, function (index, letter) {
      $("<section></section>").html(letter).appendTo(puzzle);
    });
  
    puzzle.sortable({
        items: "section",
        stop: function (event, ui) {
          var ordered = true;
          $(this)
            .find("section")
            .each(function (i, el) {
              ordered = letters[i] === $(el).html() ? ordered : false;
            });
          if (ordered){
              setTimeout(()=>{
                  $("#result").typewrite({
                    actions: [
                        {type: 'Yaaay!! You actually solved it &#128516; '},
                        {delay: 1000},
                        {type: '<br>'},
                        {type: 'You are a true Wizard!! &#129497;'},
                        {delay: 1000},
                        {type: '<br>'},
                        {type: 'Click on the below link, enable mic and check which house you get sorted into &#128521;'},
                        {delay: 1000},
                      ]
                    });
                },200)
                setTimeout(()=>{
                  $(".sortMe").fadeIn(2000);
                  $(".sortMe").css("display","inline-block");
                },15000)
          } 
        }
      })
      .show();
  });