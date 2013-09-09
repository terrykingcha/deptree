var util = require('util'),
    fs = require('fs'),
    VERSION = '0.1.0',
    options = {
      inputFile: '',
      outputFile: 'console'
    };

function serialize(deptree) {
  var revdeptree = {}, counttree = {}, queue = [], src = [],
      filepaths, filepath, deplist, depfile;

  filepaths = Object.keys(deptree);

  while ((filepath = filepaths.shift())) {
    deplist = deptree[filepath];

    for (var i = 0; i < deplist.length; i++) {
      depfile = deplist[i];
      if (!deptree[depfile]) {
        deptree[depfile] = [];
        filepaths.push(depfile);
      }
      revdeptree[depfile] || (revdeptree[depfile] = []);
      revdeptree[depfile].push(filepath);
    }

    !(counttree[filepath] = deptree[filepath].length) && queue.push(filepath);
  }

  // console.log('========================')
  // console.log(util.inspect(deptree));
  // console.log('========================')
  // console.log(util.inspect(revdeptree));
  // console.log('========================')
  // console.log(util.inspect(counttree));
  // console.log('========================')
  // console.log(util.inspect(queue));
  // console.log('========================')

  while(queue.length) {
      var cur = queue.shift();
      src.push(cur);

      if(revdeptree[cur]) {
        revdeptree[cur].forEach(function(dep){
          if(--counttree[dep] === 0)
            queue.push(dep);
        });
      }
  }

  return src;
}

function main(args) {

  if (args && args instanceof Array){
    while (args.length > 0) {
      var v = args.shift();

      switch(v) {
        case '-o':
        case '--output':
          options.outputFile = args.shift();
          break;
        case '-v':
        case '--version':
          util.print('version ' + VERSION+"\n");
          process.exit(0);
          break;
        default:
          options.inputFile = v;
          break;
      }
    }
  } else if (args && typeof args === 'object') {
    for (var k in args) {
      options[k] = args[k];
    }
  }

  if (typeof options.inputFile === 'string') {
    if (fs.existsSync(options.inputFile)) {
      try {
        options.inputFile = fs.readFileSync(options.inputFile, 'utf8').toString();
        options.inputFile = JSON.parse(options.inputFile);
      } catch(e) {
        throw new Error('the format of dependency tree is unexcpeted');
      }
    } else {
      throw new Error('no such file directly "' + options.inputFile + '"');
    }
  }

  if (typeof options.inputFile === 'object') {
    var ser = serialize(options.inputFile);
    if (options.outputFile !== '') {
      fs.writeFileSync(options.outputFile, JSON.stringify(ser));
      util.print('the serialized file "' + options.outputFile  + '" is created');
    } else if (options.outputFile === 'console') {
      util.print(ser.join(','));
    } else {
      return ser;
    }
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
} else {
  module.exports = {
    serialize: function(tree, output) {
      if (typeof tree === 'object') {
        return main({
          inputFile: tree,
          outputFile: output || ''
        });
      }
    }
  };
}