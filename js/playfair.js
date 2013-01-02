var Playfair = function() {
  var PLAYFAIR_ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  this.square = Array();

  /* Converts an input key into a normalized key.
   * 1) Convert key to uppercase
   * 2) Remove all non-alpha characters
   * 3) Change J to I (I/J will be combined on the square)
   * 4) Keep only the first occurrence of each letter
   * 
   * This method assumes that non-alpha characters are non-important
   * to the key. IOW, we never spell out numbers (the most likely
   * to be important non-alphas).
   */
  this.reduce_key = function(key) {
    // convert to upper case and remove all non-alphas, combine I/J
    var temp_key = key.toUpperCase().replace(/[^A-Z]*/g,"").replace(/J/g,"I");
    var my_alphabet = PLAYFAIR_ALPHABET;
    // Now remove any duplicates from the key
    var this_key = '';
    for (var i = 0; i < temp_key.length; i++) {
      if (my_alphabet.indexOf(temp_key.charAt(i)) >= 0) {
        this_key += temp_key.charAt(i);
        my_alphabet = my_alphabet.replace(temp_key.charAt(i), '');
      }
    }

    return this_key;
  };

  this.normalize_message = function(message, doStop, spellNumbers) {
    var nmsg = message;
    if (doStop) nmsg = nmsg.replace(/\./g,'STOP');
    if (spellNumbers) {
      nmsg = nmsg.replace(/0/g,'ZERO').replace(/1/g,'ONE')
                 .replace(/2/g,'TWO').replace(/3/g,'THREE')
                 .replace(/4/g,'FOUR').replace(/5/g,'FIVE')
                 .replace(/6/g,'SIX').replace(/7/g,'SEVEN')
                 .replace(/8/g,'EIGHT').replace(/9/g,'NINE');
    }
    // Convert to upper case, replacing J's with I's
    nmsg = nmsg.toUpperCase().replace(/J/g,'I').replace(/[^A-Z]/g,'');

    // Now to make the digraphs
    var result = Array();
    for (var k = 0; k < nmsg.length; k += 2) {
      // First, check to see if there is a next letter
      if (k + 1 >= nmsg.length) {
        nmsg += "Z";
      }

      // Now, check to see if the next letter is the same
      // as this letter. If so, we add an X and push the
      // stuff down the line
      if (nmsg[k + 1] == nmsg[k]) {
        nmsg = nmsg.substring(0, k + 1) + 'X' + nmsg.substring(k + 1);
      }

      result.push([nmsg[k], nmsg[k+1]]);
    }

    console.info(result);
    this.digraphs = result;
  };

  this.decrypt = function() {
    var decrypted_msg = '';

    // For each tuple in the normalized message
    for (k = 0; k < this.digraphs.length; k++) {
      // Get the coordinates of each letter in the square
      // for each letter
      ci = this.locate_letter(this.digraphs[k][0]);
      cj = this.locate_letter(this.digraphs[k][1]);
      console.info(this.digraphs[k][0] + " ci: " + ci.i + ci.j);
      console.info(this.digraphs[k][1] + " cj: " + cj.i + cj.j);

      // If the rows are the same, take the next letter
      // to the right for each
      var li, lj;
      if (ci.i == cj.i) {
        li = this.square[ci.i][(ci.j - 1 >= 0 ? ci.j - 1 : 5 + (ci.j - 1)) % 5];
        lj = this.square[cj.i][(cj.j - 1 >= 0 ? cj.j - 1 : 5 + (cj.j - 1)) % 5];
      } else if (ci.j == cj.j) {
        // Move one row down if they're on the same column
        li = this.square[(ci.i - 1 >= 0 ? ci.i - 1 : 5 + (ci.i - 1)) % 5][ci.j];
        lj = this.square[(cj.i - 1 >= 0 ? cj.i - 1 : 5 + (cj.i - 1)) % 5][cj.j];
      } else {
        // They're in a box, so take the opposite corners
        li = this.square[ci.i][cj.j];
        lj = this.square[cj.i][ci.j];
      }
      decrypted_msg += li + lj;
    }

    return decrypted_msg;
  };
  
  this.encrypt = function() {
    var encrypted_msg = '';

    // For each tuple in the normalized message
    for (k = 0; k < this.digraphs.length; k++) {
      // Get the coordinates of each letter in the square
      // for each letter
      ci = this.locate_letter(this.digraphs[k][0]);
      cj = this.locate_letter(this.digraphs[k][1]);
      console.info(this.digraphs[k][0] + " ci: " + ci.i + ci.j);
      console.info(this.digraphs[k][1] + " cj: " + cj.i + cj.j);

      // If the rows are the same, take the next letter
      // to the right for each
      var li, lj;
      if (ci.i == cj.i) {
        li = this.square[ci.i][(ci.j + 1) % 5];
        lj = this.square[cj.i][(cj.j + 1) % 5];
      } else if (ci.j == cj.j) {
        // Move one row down if they're on the same column
        li = this.square[(ci.i + 1) % 5][ci.j];
        lj = this.square[(cj.i + 1) % 5][cj.j];
      } else {
        // They're in a box, so take the opposite corners
        li = this.square[ci.i][cj.j];
        lj = this.square[cj.i][ci.j];
      }
      encrypted_msg += li + lj;
    }

    return encrypted_msg;
  };

  /* Generate a polybius square based on a given key.
   * Assumption: you've already reduced the key
   * Return: a 5x5 array of the grid
   */
  this.gen_polybius = function(reduced_key) {
    var my_alphabet = PLAYFAIR_ALPHABET;
    var counter = 0;
    this.square = new Array()
    for (var i = 0; i < 5; i++) {
      this.square[i] = new Array();
    }
    // First, fill the square with the key
    for (var k = 0; k < reduced_key.length; k++) {
      this.square[coor(counter).i][coor(counter).j] = reduced_key.charAt(k);
      my_alphabet = my_alphabet.replace(reduced_key.charAt(k), '');
      
      counter++;
    }

    // Now fill in the remainder of the square with
    // the remaining letters of the alphabet
    for (var k = 0; k < my_alphabet.length; k++) {
      this.square[coor(counter).i][coor(counter).j] = my_alphabet.charAt(k);
      counter++;
    }

    console.info("The square is : " + this.square);
  };

  var coor = function(k) {
    return {i: Math.floor(k / 5), j: k % 5};
  };

  this.locate_letter = function(l) {
    for (var k = 0; k < 25; k++) {
      var c = coor(k);
      if (this.square[c.i][c.j] == l) {
        return c;
      }
    }
  };
};

function render_square(square) {
  $('#squareid').empty();
  for (var i = 0; i < square.length; i++) {
    var tr = "<tr>";
    for (var j = 0; j < square[i].length; j++) {
      tr += "<td>" + square[i][j] + "</td>";
    }
    tr += "</tr>";
    $('#squareid').append(tr);
  }
}

var p;
$(document).ready(function() {
  $('#tabs a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
  });

  p = new Playfair();
  var reduced_key = p.reduce_key('');
  p.gen_polybius('');
  render_square(p.square);
  $('#inkey').keyup(function() {
    var reduced_key = p.reduce_key(this.value);
    console.info("Reduced key is: " + reduced_key);
    p.gen_polybius(reduced_key);
    console.info("Polybius square is: " + p.square);
    render_square(p.square);
  });

  $('#encrypt').click(function() {
    p.normalize_message($('#message').val(), $('#dostop').is(':checked'), $('#spellnumbers').is(':checked'));
    $('#message').val(p.encrypt());
  });

  $('#decrypt').click(function() {
    p.normalize_message($('#message').val());
    $('#message').val(p.decrypt());
  });

  // Sync preferences if available
  if (chrome.storage.sync) {
    chrome.storage.sync.get(['dostop','spellnumbers'],function(obj) {
      if (obj.dostop) $('#dostop').attr('checked','checked');
      if (obj.spellnumbers) $('#spellnumbers').attr('checked','checked');
      console.info("Recovered from storage");
    });

    $(':checkbox').change(function() {
      chrome.storage.sync.set(
        {"dostop": $('#dostop').is(':checked'),"spellnumbers": $('#spellnumbers').is(':checked')},
        function() { console.info("Saved to storage"); });
    });
  }
});
