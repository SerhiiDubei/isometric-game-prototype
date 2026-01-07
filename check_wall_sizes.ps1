Add-Type -AssemblyName System.Drawing

$walls = @('stoneWall_N.png', 'stoneWall_E.png', 'stoneWall_S.png', 'stoneWall_W.png')

foreach ($wallFile in $walls) {
    $path = Join-Path 'E:\GAME DEV STUD\Beergame\Isometric' $wallFile
    $img = [System.Drawing.Image]::FromFile($path)
    Write-Host "$wallFile : $($img.Width) x $($img.Height)"
    $img.Dispose()
}

