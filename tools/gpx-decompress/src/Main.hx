package ;
import alphatab.importer.GpxFileSystem;
import alphatab.io.BitInput;
import haxe.io.BytesBuffer;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.Stack;
import sys.FileSystem;
import sys.io.File;
import sys.io.FileOutput;

enum Mode
{
    Decompress;
    Extract;
}

class Main 
{

    public static function main() 
    {
        var args = Sys.args();
        
        var mode:Null<Mode> = null;
        var inFile:String = null;
        var outFile:String = null;
        
        if (args.length != 3)
        {
            printUsage();
            Sys.exit(1);
        }
        
        if (args[0] == "-d")
        {
            mode = Mode.Decompress;
        }
        else if (args[0] == "-x")
        {
            mode = Mode.Extract;
        }
        else
        {
            Sys.println("error: Invalid Mode!");
            printUsage();
            Sys.exit(1);
        }
        
        inFile = args[1];
        if (!FileSystem.exists(inFile))
        {
            Sys.println("error: input file not existing");
            printUsage();
            Sys.exit(1);
        }
        
        outFile = args[2];
        if (FileSystem.exists(outFile))
        {
            if (FileSystem.isDirectory(outFile))
            {
                FileSystem.deleteDirectory(outFile);
            }
            else
            {
                FileSystem.deleteFile(outFile);
            }
        }
    
        switch(mode)
        {
            case Decompress:
                decompress(inFile, outFile);
            case Extract:
                extract(inFile, outFile);
        }
    }
    
    private static function decompress(inFile:String, outFile:String)
    {
        var fs = new GpxFileSystem();
        try
        {
            var bin = new BytesInput(File.read(inFile).readAll());
            var src = new BitInput(bin);

            var header = fs.readHeader(src);
            Sys.println("Found header: '" + header + "'");
            if (header != GpxFileSystem.HeaderBcFz)
            {
                Sys.println("the requested file is no compressed gpx");
                Sys.exit(1);
            }
            
            var bout:Bytes = fs.decompress(src);
            File.saveBytes(outFile, bout);
        }
        catch (e:Dynamic)
        {
            Sys.println("error: could not decompress gpx container");
            Sys.println(e);
            Sys.println(Stack.toString(Stack.exceptionStack()));
        }
    }    
    private static function extract(inFile:String, outFile:String)
    {
        var fs = new GpxFileSystem();
        try
        {
            var bin = new BytesInput(File.read(inFile).readAll());
            fs.load(bin);
            
            FileSystem.createDirectory(outFile);
            
            outFile = StringTools.replace(outFile, "\\", "/");
            if (!StringTools.endsWith(outFile, "/"))
            {
                outFile += "/";
            }
            
            for (f in fs.files)
            {
                var target = outFile + f.fileName;
                File.saveBytes(target, f.data);
            }
        }
        catch (e:Dynamic)
        {
            Sys.println("error: could not open gpx container");
            Sys.println(e);
        }
    }
    
    private static function printUsage()
    {
        Sys.println("usage: neko gpx.n -x|-d in out");
        Sys.println("  -x ... extract the gpx file");
        Sys.println("  -d ... decompress the gpx file");
        Sys.println("  in ... the gpx file to use");
        Sys.println("  out ... the target file/directory to write into");
    }
}

